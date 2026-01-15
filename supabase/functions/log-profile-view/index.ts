import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting: 60 profile views per minute per user
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return true;
  }

  userLimit.count++;
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to get their ID
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit check
    if (isRateLimited(user.id)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { profile_id } = await req.json();

    // Validate profile_id
    if (!profile_id || typeof profile_id !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid profile_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profile_id)) {
      return new Response(
        JSON.stringify({ error: "Invalid profile_id format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Don't log self-views
    if (user.id === profile_id) {
      return new Response(
        JSON.stringify({ success: true, message: "Self-view not logged" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to insert (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if already viewed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: existing } = await supabaseAdmin
      .from("profile_views")
      .select("id")
      .eq("profile_id", profile_id)
      .eq("viewer_id", user.id)
      .gte("viewed_at", today.toISOString())
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ success: true, message: "Already viewed today" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert the view
    const { error: insertError } = await supabaseAdmin
      .from("profile_views")
      .insert({
        profile_id,
        viewer_id: user.id,
      });

    if (insertError) {
      console.error("Error logging profile view:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to log profile view" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
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
