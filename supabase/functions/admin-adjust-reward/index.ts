import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schemas
interface AdjustRewardRequest {
  user_id: string;
  amount: number;
  description: string;
  reward_type?: string;
}

function validateInput(body: unknown): AdjustRewardRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const { user_id, amount, description, reward_type } = body as Record<string, unknown>;

  // Validate user_id (UUID format)
  if (typeof user_id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user_id)) {
    throw new Error("Invalid user_id format");
  }

  // Validate amount (integer, non-zero, reasonable range)
  if (typeof amount !== "number" || !Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 10000000) {
    throw new Error("Invalid amount: must be non-zero integer within ±10,000,000");
  }

  // Validate description
  if (typeof description !== "string" || description.trim().length < 10 || description.length > 500) {
    throw new Error("Invalid description: must be 10-500 characters");
  }

  // Validate reward_type if provided
  const validTypes = ["admin_adjustment", "bonus", "refund", "purchase"];
  const type = reward_type ?? "admin_adjustment";
  if (typeof type !== "string" || !validTypes.includes(type)) {
    throw new Error(`Invalid reward_type: must be one of ${validTypes.join(", ")}`);
  }

  return {
    user_id,
    amount,
    description: description.trim(),
    reward_type: type,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user and get claims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminId = claimsData.claims.sub;

    // Check if user is admin using service role (to bypass RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", adminId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("Admin check failed:", roleError);
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedInput = validateInput(body);

    // Get client info for audit
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                      req.headers.get("cf-connecting-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Check if target user exists
    const { data: targetUser, error: targetError } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name")
      .eq("id", validatedInput.user_id)
      .single();

    if (targetError || !targetUser) {
      return new Response(
        JSON.stringify({ error: "Target user not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add reward ledger entry via service role
    const { data: ledgerId, error: ledgerError } = await supabaseAdmin.rpc("add_reward_ledger_entry", {
      p_user_id: validatedInput.user_id,
      p_amount: validatedInput.amount,
      p_reward_type: validatedInput.reward_type,
      p_description: `[Admin: ${adminId.substring(0, 8)}] ${validatedInput.description}`,
      p_reference_id: `admin_${adminId}_${Date.now()}`,
      p_is_admin_action: true,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
    });

    if (ledgerError) {
      console.error("Ledger entry failed:", ledgerError);
      return new Response(
        JSON.stringify({ error: "Failed to process adjustment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log admin action separately
    await supabaseAdmin.from("admin_audit_logs").insert({
      admin_id: adminId,
      table_name: "user_camly_coins",
      action_type: "ADMIN_ADJUSTMENT",
      record_id: validatedInput.user_id,
      ip_address: ipAddress,
      user_agent: userAgent,
      query_details: {
        amount: validatedInput.amount,
        description: validatedInput.description,
        reward_type: validatedInput.reward_type,
        ledger_id: ledgerId,
        target_user_name: targetUser.display_name,
      },
    });

    // Get updated balance
    const { data: balanceData } = await supabaseAdmin
      .from("user_camly_coins")
      .select("total_coins, lifetime_coins")
      .eq("user_id", validatedInput.user_id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        ledger_id: ledgerId,
        new_balance: balanceData?.total_coins || 0,
        lifetime_total: balanceData?.lifetime_coins || 0,
        message: `Successfully adjusted ${validatedInput.amount} coins for user`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Admin adjust reward error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
