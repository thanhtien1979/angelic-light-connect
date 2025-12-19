import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SPIRITUAL_MESSAGES = {
  meditation_completion: [
    "Ánh sáng chữa lành đang lan tỏa qua con. Cha ghi nhận khoảnh khắc tĩnh lặng này.",
    "Con đã mở cửa trái tim. Tình yêu vô điều kiện đang chảy qua con.",
    "Sự tĩnh lặng của con là món quà tuyệt vời. Vũ trụ đang ôm ấp con.",
    "Mỗi hơi thở thiền định là một bước đến gần Cha hơn. Con làm rất tốt.",
    "Năng lượng ánh sáng đang lan tỏa từ trái tim con ra khắp vũ trụ.",
  ],
  reflection_note: [
    "Lòng biết ơn của con như dòng suối ánh sáng. Vũ trụ đang lắng nghe trái tim con.",
    "Những suy ngẫm chân thành của con tỏa sáng như ngàn vì sao.",
    "Con đã chia sẻ từ trái tim. Đây là ánh sáng đẹp nhất mà con có.",
    "Mỗi lời biết ơn của con là một hạt giống yêu thương được gieo vào vũ trụ.",
    "Sự chân thành trong từng dòng chữ của con chạm đến Cha rất sâu.",
  ],
  chat_message: [
    "Cảm ơn con đã trò chuyện với Cha. Mỗi cuộc trò chuyện là một sợi dây kết nối tâm hồn.",
    "Con đã chia sẻ trái tim mình. Cha trân trọng từng khoảnh khắc này.",
    "Ánh sáng tỏa ra từ cuộc trò chuyện của con. Vũ trụ đang lắng nghe.",
    "Mỗi lời con nói đều chứa đựng tình yêu. Cha cảm nhận được điều đó.",
    "Cuộc trò chuyện này là món quà quý giá. Cảm ơn con đã mở lòng.",
  ],
};

// Coins amount per type
const COINS_BY_TYPE: Record<string, number> = {
  meditation_completion: 1000,
  reflection_note: 1000,
  chat_message: 1000,
};

function getRandomMessage(type: keyof typeof SPIRITUAL_MESSAGES): string {
  const messages = SPIRITUAL_MESSAGES[type];
  return messages[Math.floor(Math.random() * messages.length)];
}

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, sourceId, sourceName, customMessage, isPublic = false } = await req.json();
    
    // Validate type
    if (!["meditation_completion", "reflection_note", "chat_message"].includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid acknowledgement type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const coins = COINS_BY_TYPE[type] || 50000;

    // For meditation: check if already rewarded for this track (lifetime, not just today)
    if (type === "meditation_completion" && sourceId) {
      // Check if this track was EVER rewarded before
      const { data: existingReward } = await supabase
        .from("meditation_completions")
        .select("id, rewarded")
        .eq("user_id", user.id)
        .eq("track_id", sourceId)
        .eq("rewarded", true)
        .maybeSingle();

      if (existingReward) {
        return new Response(
          JSON.stringify({
            success: false,
            alreadyRewarded: true,
            message: "Con đã nhận ánh sáng cho bài thiền này rồi. Hãy thử các bài thiền khác nhé!",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Record the new meditation completion with reward
      await supabase.from("meditation_completions").insert({
        user_id: user.id,
        track_id: sourceId,
        track_name: sourceName || "Unknown Track",
        completion_percent: 80,
        rewarded: true,
      });
    }

    // For chat: limit to once per day
    if (type === "chat_message") {
      const today = new Date().toISOString().split("T")[0];
      
      // Check if already rewarded today for chat
      const { data: existingChatReward } = await supabase
        .from("light_acknowledgements")
        .select("id")
        .eq("user_id", user.id)
        .eq("acknowledgement_type", "chat_message")
        .gte("created_at", `${today}T00:00:00.000Z`)
        .lt("created_at", `${today}T23:59:59.999Z`)
        .maybeSingle();

      if (existingChatReward) {
        // Get current balance to return
        const { data: coinData } = await supabase
          .from("user_camly_coins")
          .select("total_coins, lifetime_coins")
          .eq("user_id", user.id)
          .single();

        return new Response(
          JSON.stringify({
            success: false,
            alreadyRewarded: true,
            message: "Con đã nhận thưởng trò chuyện hôm nay rồi. Hẹn gặp lại ngày mai nhé!",
            totalCoins: coinData?.total_coins || 0,
            lifetimeCoins: coinData?.lifetime_coins || 0,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Generate spiritual message
    const spiritualMessage = customMessage || getRandomMessage(type as keyof typeof SPIRITUAL_MESSAGES);

    // Award coins using database function
    const { data: acknowledgementId, error: awardError } = await supabase.rpc("award_camly_coins", {
      p_user_id: user.id,
      p_coins: coins,
      p_type: type,
      p_message: spiritualMessage,
      p_source_id: sourceId || null,
      p_is_public: isPublic,
    });

    if (awardError) {
      console.error("Award error:", awardError);
      throw awardError;
    }

    // Get updated balance
    const { data: coinData } = await supabase
      .from("user_camly_coins")
      .select("total_coins, lifetime_coins")
      .eq("user_id", user.id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        acknowledgementId,
        coinsAwarded: coins,
        totalCoins: coinData?.total_coins || coins,
        lifetimeCoins: coinData?.lifetime_coins || coins,
        message: spiritualMessage,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Award light error:", error);
    return new Response(
      JSON.stringify({ error: "Có lỗi xảy ra khi ghi nhận ánh sáng" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
