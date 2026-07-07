import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated caller; attribute event to that user only
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const authedUserId = userData.user.id;

    const {
      event_type,
      event_severity = "info",
      endpoint = null,
      details = {},
    } = await req.json();

    // Validate event_type
    const validTypes = ["rate_limit", "failed_auth", "suspicious_activity", "data_access"];
    if (!event_type || !validTypes.includes(event_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid event_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate severity
    const validSeverities = ["info", "warn", "error", "critical"];
    if (!validSeverities.includes(event_severity)) {
      return new Response(
        JSON.stringify({ error: "Invalid event_severity" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client info
    const ip_address = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                       req.headers.get("cf-connecting-ip") || 
                       "unknown";
    const user_agent = req.headers.get("user-agent") || "unknown";

    // Use service role to insert (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data, error } = await supabaseAdmin.rpc("log_security_event", {
      p_event_type: event_type,
      p_event_severity: event_severity,
      p_user_id: authedUserId,
      p_ip_address: ip_address,
      p_user_agent: user_agent,
      p_endpoint: endpoint,
      p_details: details,
    });

    if (error) {
      console.error("Error logging security event:", error);
      return new Response(
        JSON.stringify({ error: "Failed to log event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, log_id: data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
