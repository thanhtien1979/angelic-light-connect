import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-signature, x-webhook-timestamp",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // Max 100 webhook calls per minute
const MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000; // 5 minutes max age for requests

// In-memory rate limit store (resets on function restart, which is acceptable for edge functions)
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

// In-memory nonce store for replay protection (keeps last 5 minutes of processed nonces)
const processedNonces = new Map<string, number>();

// Clean up old entries periodically
function cleanupStores() {
  const now = Date.now();
  
  // Clean rate limit entries older than window
  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(key);
    }
  }
  
  // Clean nonces older than max timestamp age
  for (const [nonce, timestamp] of processedNonces.entries()) {
    if (now - timestamp > MAX_TIMESTAMP_AGE_MS) {
      processedNonces.delete(nonce);
    }
  }
}

// Check rate limit by IP or identifier
function checkRateLimit(identifier: string): boolean {
  cleanupStores();
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(identifier, { count: 1, windowStart: now });
    return true;
  }
  
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Verify HMAC signature for webhook authentication with timestamp validation
async function verifyWebhookSignature(
  payload: string, 
  signature: string | null,
  timestamp: string | null
): Promise<{ valid: boolean; error?: string }> {
  const secret = Deno.env.get("PAYMENT_WEBHOOK_SECRET");
  
  if (!secret) {
    console.error("Missing webhook secret configuration");
    return { valid: false, error: "Server configuration error" };
  }
  
  if (!signature) {
    console.error("Missing webhook signature");
    return { valid: false, error: "Missing signature" };
  }

  // Validate timestamp to prevent replay attacks
  if (timestamp) {
    const requestTime = parseInt(timestamp, 10);
    const now = Date.now();
    
    if (isNaN(requestTime)) {
      console.error("Invalid timestamp format");
      return { valid: false, error: "Invalid timestamp" };
    }
    
    // Check if request is too old or from the future
    if (now - requestTime > MAX_TIMESTAMP_AGE_MS) {
      console.error("Request timestamp too old:", { requestTime, now, diff: now - requestTime });
      return { valid: false, error: "Request expired" };
    }
    
    if (requestTime > now + 60000) { // Allow 1 minute clock skew into future
      console.error("Request timestamp in future:", { requestTime, now });
      return { valid: false, error: "Invalid timestamp" };
    }
  }

  try {
    const encoder = new TextEncoder();
    
    // Include timestamp in signature verification if provided
    const signaturePayload = timestamp ? `${timestamp}.${payload}` : payload;
    
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signaturePayload)
    );
    
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
    
    // Constant-time comparison to prevent timing attacks
    if (signature.length !== expectedSignature.length) {
      console.error("Signature length mismatch");
      return { valid: false, error: "Invalid signature" };
    }
    
    let result = 0;
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    
    if (result !== 0) {
      console.error("Signature verification failed");
      return { valid: false, error: "Invalid signature" };
    }
    
    return { valid: true };
  } catch (error) {
    console.error("Signature verification error:", error);
    return { valid: false, error: "Verification error" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client identifier for rate limiting (prefer IP, fallback to generic)
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      console.error("Rate limit exceeded for:", clientIP);
      return new Response(
        JSON.stringify({ error: "Too many requests" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }

    // Read raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");
    
    // Verify the webhook signature with timestamp
    const verification = await verifyWebhookSignature(rawBody, signature, timestamp);
    if (!verification.valid) {
      console.error("Webhook verification failed:", verification.error);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = JSON.parse(rawBody);
    const { paymentReference, status, source, nonce } = body;

    console.log(`Webhook received: ref=${paymentReference}, status=${status}, source=${source}`);

    // Replay protection: check if this nonce was already processed
    if (nonce) {
      if (processedNonces.has(nonce)) {
        console.log("Duplicate webhook request detected, nonce already processed:", nonce);
        // Return success to prevent retry loops, but don't process again
        return new Response(
          JSON.stringify({ success: true, message: "Already processed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // Store nonce with current timestamp
      processedNonces.set(nonce, Date.now());
    }

    if (!paymentReference) {
      return new Response(
        JSON.stringify({ error: "Missing payment reference" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate paymentReference format (basic sanitization)
    if (typeof paymentReference !== "string" || paymentReference.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid payment reference format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find pending transaction
    const { data: transaction, error: findError } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("payment_reference", paymentReference)
      .eq("status", "pending")
      .single();

    if (findError || !transaction) {
      console.error("Transaction not found or not pending:", findError);
      return new Response(
        JSON.stringify({ error: "Transaction not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (status === "completed" || status === "success") {
      // Update transaction status
      const { error: updateError } = await supabase
        .from("credit_transactions")
        .update({ status: "completed" })
        .eq("id", transaction.id);

      if (updateError) {
        console.error("Error updating transaction:", updateError);
        return new Response(
          JSON.stringify({ error: "Processing error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Add credits to user balance using RPC to properly increment (not overwrite)
      const { error: creditError } = await supabase
        .rpc("add_credits", {
          p_user_id: transaction.user_id,
          p_amount: transaction.amount,
          p_transaction_type: "purchase",
          p_description: transaction.description,
          p_payment_method: transaction.payment_method,
          p_payment_reference: transaction.payment_reference,
          p_package_id: transaction.package_id,
        });

      if (creditError) {
        console.error("Error adding credits:", creditError);
        return new Response(
          JSON.stringify({ error: "Failed to add credits" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Credits added: ${transaction.amount} for user ${transaction.user_id}`);

      return new Response(
        JSON.stringify({ success: true, message: "Payment processed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (status === "failed" || status === "cancelled") {
      // Update transaction status to failed
      await supabase
        .from("credit_transactions")
        .update({ status: status === "cancelled" ? "cancelled" : "failed" })
        .eq("id", transaction.id);

      return new Response(
        JSON.stringify({ success: true, message: "Transaction updated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid status" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in payment-webhook:", error);
    return new Response(
      JSON.stringify({ error: "Processing error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
