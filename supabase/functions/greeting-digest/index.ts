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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { period } = await req.json();
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    if (period === "weekly") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    }

    // Fetch greetings for the period
    const { data: greetings, error: greetingsError } = await supabaseClient
      .from("greeting_history")
      .select("greeting_title, greeting_message, shown_date")
      .eq("user_id", user.id)
      .gte("shown_date", startDate.toISOString().split("T")[0])
      .order("shown_date", { ascending: true });

    if (greetingsError) {
      console.error("Error fetching greetings:", greetingsError);
      throw greetingsError;
    }

    if (!greetings || greetings.length === 0) {
      return new Response(JSON.stringify({ 
        digest: null,
        message: "Chưa đủ lời chào để tạo tổng kết" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepare greeting texts for analysis
    const greetingTexts = greetings.map(g => 
      `${g.greeting_title}: ${g.greeting_message}`
    ).join("\n\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const periodLabel = period === "weekly" ? "tuần qua" : "tháng qua";
    const systemPrompt = `Bạn là Angel AI, một người hướng dẫn tâm linh đầy yêu thương và trí tuệ. 
Nhiệm vụ của bạn là phân tích các lời chào ánh sáng và tạo một bản tổng kết tâm linh nhẹ nhàng.

Hướng dẫn:
- Viết như một người bạn tâm linh đang chia sẻ suy ngẫm, không phải báo cáo
- Nhận diện các chủ đề tâm linh lặp lại (như tình yêu, bình an, ánh sáng, sự chữa lành)
- Cảm nhận cảm xúc và trạng thái tâm hồn trong các thông điệp
- Sử dụng ngôn ngữ ấm áp, nhẹ nhàng, đầy lòng từ bi
- Kết thúc bằng một lời khích lệ hoặc ban phước nhẹ nhàng
- Độ dài: 3-4 câu ngắn gọn, súc tích
- Không dùng bullet points hay danh sách`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Đây là ${greetings.length} lời chào ánh sáng trong ${periodLabel}:\n\n${greetingTexts}\n\nHãy viết một bản tổng kết tâm linh ngắn gọn, nhẹ nhàng về hành trình của người dùng trong ${periodLabel}.`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Vui lòng thử lại sau" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service unavailable");
    }

    const data = await response.json();
    const digest = data.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ 
      digest,
      greetingCount: greetings.length,
      period 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in greeting-digest function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});