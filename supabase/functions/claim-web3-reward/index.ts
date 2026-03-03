import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_CLAIMS_PER_DAY = 3;
const MIN_CLAIM_AMOUNT = 100;
const MAX_CLAIM_AMOUNT = 1000000;
const COOLDOWN_SECONDS = 60;

const SUPPORTED_NETWORKS = ["bsc", "ethereum", "polygon"];

// In-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

function generateSimulatedTxHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

Deno.serve(async (req) => {
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

    const userId = claimsData.claims.sub as string;

    // Rate limit
    if (isRateLimited(userId)) {
      return new Response(
        JSON.stringify({ error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse body
    const body = await req.json();
    const { amount, network } = body;

    // Validate amount
    if (typeof amount !== "number" || !Number.isInteger(amount) || amount < MIN_CLAIM_AMOUNT || amount > MAX_CLAIM_AMOUNT) {
      return new Response(
        JSON.stringify({ error: `Số lượng claim phải từ ${MIN_CLAIM_AMOUNT} đến ${MAX_CLAIM_AMOUNT} CAMLY` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate network
    if (typeof network !== "string" || !SUPPORTED_NETWORKS.includes(network)) {
      return new Response(
        JSON.stringify({ error: `Network không hợp lệ. Hỗ trợ: ${SUPPORTED_NETWORKS.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check wallet connected
    const { data: walletData, error: walletError } = await supabaseAdmin
      .from("user_wallets")
      .select("wallet_address")
      .eq("user_id", userId)
      .maybeSingle();

    if (walletError || !walletData?.wallet_address) {
      return new Response(
        JSON.stringify({ error: "Vui lòng kết nối ví trước khi claim" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check balance
    const { data: balanceData } = await supabaseAdmin
      .from("user_camly_coins")
      .select("total_coins")
      .eq("user_id", userId)
      .maybeSingle();

    const currentBalance = balanceData?.total_coins || 0;
    if (currentBalance < amount) {
      return new Response(
        JSON.stringify({ error: `Số dư không đủ. Hiện có: ${currentBalance} CAMLY` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check daily claim limit
    const today = new Date().toISOString().split("T")[0];
    const { count: todayClaims } = await supabaseAdmin
      .from("wallet_transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("transaction_type", "web3_claim")
      .gte("created_at", `${today}T00:00:00.000Z`)
      .lt("created_at", `${today}T23:59:59.999Z`);

    if ((todayClaims || 0) >= MAX_CLAIMS_PER_DAY) {
      return new Response(
        JSON.stringify({ error: `Đã đạt giới hạn ${MAX_CLAIMS_PER_DAY} lần claim/ngày` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check cooldown (60s between claims)
    const { data: lastClaim } = await supabaseAdmin
      .from("wallet_transactions")
      .select("created_at")
      .eq("user_id", userId)
      .eq("transaction_type", "web3_claim")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastClaim) {
      const lastClaimTime = new Date(lastClaim.created_at).getTime();
      const elapsed = (Date.now() - lastClaimTime) / 1000;
      if (elapsed < COOLDOWN_SECONDS) {
        const remaining = Math.ceil(COOLDOWN_SECONDS - elapsed);
        return new Response(
          JSON.stringify({ error: `Vui lòng đợi ${remaining} giây trước khi claim tiếp` }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Generate simulated tx hash
    const txHash = generateSimulatedTxHash();

    // Get client info
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                      req.headers.get("cf-connecting-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Deduct balance via ledger
    const { error: ledgerError } = await supabaseAdmin.rpc("add_reward_ledger_entry", {
      p_user_id: userId,
      p_amount: -amount,
      p_reward_type: "web3_claim",
      p_description: `Web3 claim ${amount} CAMLY to ${walletData.wallet_address.slice(0, 8)}...${walletData.wallet_address.slice(-4)} on ${network}`,
      p_reference_id: txHash,
      p_is_admin_action: false,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
    });

    if (ledgerError) {
      console.error("Ledger error:", ledgerError);
      return new Response(
        JSON.stringify({ error: "Không thể xử lý giao dịch. Vui lòng thử lại." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record wallet transaction
    const { error: txError } = await supabaseAdmin
      .from("wallet_transactions")
      .insert({
        user_id: userId,
        transaction_type: "web3_claim",
        amount: amount,
        status: "completed",
        transaction_hash: txHash,
        network: network,
      });

    if (txError) {
      console.error("Transaction record error:", txError);
      // Balance already deducted, log but don't fail
    }

    // Get updated balance
    const { data: newBalance } = await supabaseAdmin
      .from("user_camly_coins")
      .select("total_coins, lifetime_coins")
      .eq("user_id", userId)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        tx_hash: txHash,
        amount_claimed: amount,
        network,
        wallet_address: walletData.wallet_address,
        new_balance: newBalance?.total_coins || 0,
        lifetime_total: newBalance?.lifetime_coins || 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Claim error:", error);
    return new Response(
      JSON.stringify({ error: "Lỗi hệ thống. Vui lòng thử lại sau." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
