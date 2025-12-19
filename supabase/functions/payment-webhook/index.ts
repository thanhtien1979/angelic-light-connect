import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { paymentReference, status, source } = body;

    console.log(`Webhook received: ${paymentReference}, status: ${status}, source: ${source}`);

    if (!paymentReference) {
      return new Response(
        JSON.stringify({ error: "Missing payment reference" }),
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
      console.error("Transaction not found:", findError);
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
          JSON.stringify({ error: "Failed to update transaction" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Add credits to user balance
      const { error: creditError } = await supabase
        .from("user_camly_coins")
        .upsert({
          user_id: transaction.user_id,
          total_coins: transaction.amount,
          lifetime_coins: transaction.amount,
        }, {
          onConflict: "user_id",
        });

      // If upsert doesn't work properly, update manually
      if (creditError) {
        const { error: updateCreditError } = await supabase
          .rpc("add_credits", {
            p_user_id: transaction.user_id,
            p_amount: transaction.amount,
            p_transaction_type: "purchase",
            p_description: transaction.description,
            p_payment_method: transaction.payment_method,
            p_payment_reference: transaction.payment_reference,
            p_package_id: transaction.package_id,
          });

        if (updateCreditError) {
          console.error("Error adding credits:", updateCreditError);
        }
      }

      console.log(`Credits added: ${transaction.amount} for user ${transaction.user_id}`);

      return new Response(
        JSON.stringify({ success: true, message: "Payment processed successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (status === "failed" || status === "cancelled") {
      // Update transaction status to failed
      await supabase
        .from("credit_transactions")
        .update({ status: status === "cancelled" ? "cancelled" : "failed" })
        .eq("id", transaction.id);

      return new Response(
        JSON.stringify({ success: true, message: "Transaction marked as " + status }),
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
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
