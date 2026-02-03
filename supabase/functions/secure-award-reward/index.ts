import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Valid reward types and their max amounts (to prevent abuse)
const REWARD_CONFIG: Record<string, { maxAmount: number; dailyLimit: number }> = {
  meditation_completion: { maxAmount: 1000, dailyLimit: 5 },
  reflection_note: { maxAmount: 1000, dailyLimit: 3 },
  chat_message: { maxAmount: 1000, dailyLimit: 1 },
  daily_login: { maxAmount: 500, dailyLimit: 1 },
};

interface AwardRequest {
  reward_type: string;
  amount: number;
  description: string;
  reference_id?: string;
}

function validateInput(body: unknown): AwardRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const { reward_type, amount, description, reference_id } = body as Record<string, unknown>;

  // Validate reward_type
  if (typeof reward_type !== "string" || !REWARD_CONFIG[reward_type]) {
    throw new Error(`Invalid reward_type: must be one of ${Object.keys(REWARD_CONFIG).join(", ")}`);
  }

  const config = REWARD_CONFIG[reward_type];

  // Validate amount
  if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0 || amount > config.maxAmount) {
    throw new Error(`Invalid amount: must be positive integer up to ${config.maxAmount}`);
  }

  // Validate description
  if (typeof description !== "string" || description.trim().length < 5 || description.length > 500) {
    throw new Error("Invalid description: must be 5-500 characters");
  }

  // Validate reference_id if provided
  if (reference_id !== undefined && (typeof reference_id !== "string" || reference_id.length > 100)) {
    throw new Error("Invalid reference_id: must be string up to 100 characters");
  }

  return {
    reward_type,
    amount,
    description: description.trim(),
    reference_id: reference_id as string | undefined,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    // Parse and validate input
    const body = await req.json();
    const validatedInput = validateInput(body);

    // Use service role for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check daily limit
    const today = new Date().toISOString().split("T")[0];
    const { count: todayCount } = await supabaseAdmin
      .from("reward_ledger")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("reward_type", validatedInput.reward_type)
      .gte("created_at", `${today}T00:00:00.000Z`)
      .lt("created_at", `${today}T23:59:59.999Z`);

    const config = REWARD_CONFIG[validatedInput.reward_type];
    if ((todayCount || 0) >= config.dailyLimit) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Daily limit reached for ${validatedInput.reward_type}`,
          limit: config.dailyLimit,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for duplicate reference_id (prevent replay attacks)
    if (validatedInput.reference_id) {
      const { data: existing } = await supabaseAdmin
        .from("reward_ledger")
        .select("id")
        .eq("user_id", userId)
        .eq("reference_id", validatedInput.reference_id)
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Reward already claimed for this reference",
            already_claimed: true,
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get client info
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                      req.headers.get("cf-connecting-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Add ledger entry
    const { data: ledgerId, error: ledgerError } = await supabaseAdmin.rpc("add_reward_ledger_entry", {
      p_user_id: userId,
      p_amount: validatedInput.amount,
      p_reward_type: validatedInput.reward_type,
      p_description: validatedInput.description,
      p_reference_id: validatedInput.reference_id || null,
      p_is_admin_action: false,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
    });

    if (ledgerError) {
      console.error("Ledger entry failed:", ledgerError);
      return new Response(
        JSON.stringify({ error: "Failed to award reward" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get updated balance
    const { data: balanceData } = await supabaseAdmin
      .from("user_camly_coins")
      .select("total_coins, lifetime_coins")
      .eq("user_id", userId)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        ledger_id: ledgerId,
        amount_awarded: validatedInput.amount,
        new_balance: balanceData?.total_coins || 0,
        lifetime_total: balanceData?.lifetime_coins || 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Secure award reward error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
