import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PACKAGES: Record<string, { credits: number; price: number; name: string }> = {
  starter: { credits: 50, price: 49000, name: "Starter" },
  popular: { credits: 150, price: 129000, name: "Popular" },
  premium: { credits: 500, price: 349000, name: "Premium" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { packageId, paymentMethod } = await req.json();

    if (!packageId || !PACKAGES[packageId]) {
      return new Response(
        JSON.stringify({ error: "Invalid package" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pkg = PACKAGES[packageId];
    const paymentReference = `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create pending transaction
    const { data: transaction, error: txError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: user.id,
        transaction_type: "purchase",
        amount: pkg.credits,
        description: `Nạp gói ${pkg.name} - ${pkg.credits} credits`,
        payment_method: paymentMethod || "bank_transfer",
        payment_reference: paymentReference,
        package_id: packageId,
        status: "pending",
      })
      .select()
      .single();

    if (txError) {
      console.error("Error creating transaction:", txError);
      return new Response(
        JSON.stringify({ error: "Failed to create transaction" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For now, return bank transfer info (VNPay/MoMo integration requires API keys)
    const bankInfo = {
      bankName: "Vietcombank",
      accountNumber: "1234567890",
      accountName: "CAMLY APP",
      amount: pkg.price,
      transferContent: paymentReference,
      note: `Chuyển khoản ${pkg.price.toLocaleString("vi-VN")}đ với nội dung: ${paymentReference}`,
    };

    // Check for VNPay/MoMo API keys
    const vnpaySecretKey = Deno.env.get("VNPAY_SECRET_KEY");
    const momoSecretKey = Deno.env.get("MOMO_SECRET_KEY");

    let paymentUrl: string | null = null;
    
    // TODO: Implement VNPay/MoMo payment URL generation when API keys are available
    if (paymentMethod === "vnpay" && vnpaySecretKey) {
      // VNPay integration would go here
      console.log("VNPay integration - API key available");
    } else if (paymentMethod === "momo" && momoSecretKey) {
      // MoMo integration would go here
      console.log("MoMo integration - API key available");
    }

    // Payment transaction created successfully

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: transaction.id,
        paymentReference,
        package: pkg,
        bankInfo,
        paymentUrl,
        message: paymentUrl 
          ? "Vui lòng hoàn tất thanh toán" 
          : "Vui lòng chuyển khoản theo thông tin bên dưới",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in create-payment:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
