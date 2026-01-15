import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_USER = 10; // Max 10 token requests per minute per user

// In-memory rate limit store
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(key);
    }
  }
}

function checkRateLimit(userId: string): boolean {
  cleanupRateLimitStore();
  const now = Date.now();
  const entry = rateLimitStore.get(userId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_USER) {
    return false;
  }

  entry.count++;
  return true;
}

const ELEVENLABS_AGENT_ID = Deno.env.get("ELEVENLABS_AGENT_ID");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    // Authentication: Verify user is logged in
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return json({ error: "Unauthorized" }, 401);
    }

    // Rate limiting by user ID
    if (!checkRateLimit(user.id)) {
      console.error("Rate limit exceeded for user:", user.id);
      return json({ error: "Too many requests. Please wait a moment." }, 429);
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      console.error("Missing ElevenLabs configuration: ELEVENLABS_API_KEY");
      return json({ error: "Server configuration error" }, 500);
    }

    if (!ELEVENLABS_AGENT_ID) {
      console.error("Missing ElevenLabs configuration: ELEVENLABS_AGENT_ID");
      return json({ error: "Server configuration error" }, 500);
    }

    console.log("Fetching signed URL for agent:", ELEVENLABS_AGENT_ID, "user:", user.id);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${ELEVENLABS_AGENT_ID}`,
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      return json({ error: "Failed to get signed URL" }, 502);
    }

    const data = await response.json();
    console.log("Successfully obtained signed URL for user:", user.id);

    return json({ signed_url: data.signed_url });
  } catch (error) {
    console.error("Conversation token error:", error);
    return new Response(JSON.stringify({ error: "Processing error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
