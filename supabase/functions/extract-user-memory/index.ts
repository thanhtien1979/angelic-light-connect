import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXTRACTION_PROMPT = `Bạn là một trợ lý phân tích cuộc trò chuyện tâm linh. Nhiệm vụ của bạn là trích xuất thông tin quan trọng về người dùng từ cuộc trò chuyện.

Hãy phân tích cuộc trò chuyện và trích xuất thông tin theo các loại sau:
- personal: Thông tin cá nhân (tên, tuổi, nghề nghiệp, gia đình)
- preference: Sở thích, thói quen, điều họ thích/không thích
- goal: Mục tiêu tâm linh, cuộc sống, điều họ muốn đạt được
- struggle: Khó khăn, thách thức họ đang đối mặt
- milestone: Cột mốc, thành tựu, tiến bộ họ đã đạt được
- interest: Chủ đề tâm linh họ quan tâm

Trả về JSON với cấu trúc:
{
  "memories": [
    {
      "type": "personal" | "preference" | "goal" | "struggle" | "milestone" | "interest",
      "key": "Tên ngắn gọn cho memory (ví dụ: 'name', 'favorite_meditation', 'current_challenge')",
      "value": "Giá trị chi tiết",
      "importance": 1-10 (10 = rất quan trọng)
    }
  ]
}

Chỉ trích xuất thông tin rõ ràng được người dùng chia sẻ, không suy đoán.
Nếu không có thông tin mới đáng lưu, trả về {"memories": []}.`;

interface Memory {
  type: string;
  key: string;
  value: string;
  importance: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ memories: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format conversation for analysis
    const conversationText = messages
      .slice(-10) // Only analyze last 10 messages for efficiency
      .map((m: { role: string; content: string }) => 
        `${m.role === "user" ? "Người dùng" : "Angel AI"}: ${m.content}`
      )
      .join("\n\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: EXTRACTION_PROMPT },
          { role: "user", content: conversationText },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error("AI extraction failed:", response.status);
      return new Response(JSON.stringify({ memories: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    let extracted: { memories: Memory[] };
    try {
      extracted = JSON.parse(content);
    } catch {
      extracted = { memories: [] };
    }

    if (!extracted.memories || extracted.memories.length === 0) {
      return new Response(JSON.stringify({ memories: [], saved: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save memories to database
    let savedCount = 0;
    for (const memory of extracted.memories) {
      if (!memory.type || !memory.key || !memory.value) continue;

      // Check if memory already exists
      const { data: existing } = await supabase
        .from("user_memory")
        .select("id")
        .eq("user_id", user.id)
        .eq("memory_type", memory.type)
        .eq("memory_key", memory.key)
        .single();

      if (existing) {
        // Update existing memory
        await supabase
          .from("user_memory")
          .update({
            memory_value: memory.value,
            importance_score: memory.importance || 5,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        // Insert new memory
        await supabase
          .from("user_memory")
          .insert({
            user_id: user.id,
            memory_type: memory.type,
            memory_key: memory.key,
            memory_value: memory.value,
            importance_score: memory.importance || 5,
          });
      }
      savedCount++;
    }

    return new Response(JSON.stringify({ 
      memories: extracted.memories, 
      saved: savedCount 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Extract memory error:", error);
    return new Response(JSON.stringify({ error: "Failed to extract memories" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
