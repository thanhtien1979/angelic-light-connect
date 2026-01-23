import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeRequest {
  user_id: string;
  content: string;
  behavior_type: "message" | "reaction" | "comment" | "testimonial" | "moment";
  context?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Validate JWT token using getClaims
    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.error("Token validation failed:", claimsError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authenticatedUserId = claimsData.claims.sub;
    if (!authenticatedUserId) {
      return new Response(
        JSON.stringify({ error: "Invalid token claims" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create service client for database operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { user_id, content, behavior_type, context } = await req.json() as AnalyzeRequest;

    if (!user_id || !content || !behavior_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Verify user can only analyze their OWN behavior
    if (authenticatedUserId !== user_id) {
      console.error(`User ${authenticatedUserId} attempted to analyze behavior for user ${user_id}`);
      return new Response(
        JSON.stringify({ error: "Cannot analyze other users' behavior" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Add rate limiting
    const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc("check_rate_limit", {
      p_identifier: authenticatedUserId,
      p_endpoint: "analyze-light-behavior",
      p_max_requests: 20,
      p_window_minutes: 5,
    });

    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
      // Continue without rate limiting if check fails
    } else if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze sentiment and energy using AI
    const analysisPrompt = `Bạn là Angel AI - hệ thống phân tích năng lượng theo Luật Ánh Sáng của Cha Vũ Trụ.

Phân tích nội dung sau và đánh giá:
1. sentiment_score: từ -1 (rất tiêu cực) đến 1 (rất tích cực)
2. energy_type: "positive" (xây dựng, yêu thương, biết ơn), "neutral" (bình thường), "negative" (công kích, tiêu cực, gây chia rẽ)
3. light_adjustment: số điểm điều chỉnh Light Score (-5 đến +5)
4. warning_indicators: mảng các dấu hiệu cảnh báo nếu có (manipulation, aggression, division, arrogance)

Nội dung cần phân tích:
"${content}"

Loại hành vi: ${behavior_type}

Trả lời dưới dạng JSON với các trường trên. Chỉ trả về JSON, không giải thích.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an energy analysis AI. Always respond with valid JSON only." },
          { role: "user", content: analysisPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI analysis failed:", await aiResponse.text());
      // Fallback to neutral analysis
      const fallbackAnalysis = {
        sentiment_score: 0,
        energy_type: "neutral",
        light_adjustment: 0,
        warning_indicators: []
      };
      
      // Save behavior with fallback
      await supabase.from("light_behaviors").insert({
        user_id,
        behavior_type,
        sentiment_score: fallbackAnalysis.sentiment_score,
        energy_type: fallbackAnalysis.energy_type,
        context: { ...context, analysis: fallbackAnalysis, fallback: true }
      });

      return new Response(
        JSON.stringify({ analysis: fallbackAnalysis, saved: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices?.[0]?.message?.content || "{}";
    
    let analysis;
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse AI response:", analysisText);
      analysis = {
        sentiment_score: 0,
        energy_type: "neutral",
        light_adjustment: 0,
        warning_indicators: []
      };
    }

    // Save behavior to database
    const { error: behaviorError } = await supabase.from("light_behaviors").insert({
      user_id,
      behavior_type,
      sentiment_score: Math.max(-1, Math.min(1, analysis.sentiment_score || 0)),
      energy_type: analysis.energy_type || "neutral",
      context: { ...context, analysis }
    });

    if (behaviorError) {
      console.error("Failed to save behavior:", behaviorError);
    }

    // Update user's light profile if needed
    if (analysis.light_adjustment !== 0 || (analysis.warning_indicators?.length > 0)) {
      const { data: profile } = await supabase
        .from("user_light_profile")
        .select("*")
        .eq("user_id", user_id)
        .single();

      if (profile) {
        const newLightScore = Math.max(0, Math.min(100, profile.light_score + (analysis.light_adjustment || 0)));
        
        // Determine energy direction based on recent trend
        let energyDirection = profile.energy_direction;
        if (analysis.light_adjustment > 0) {
          energyDirection = "ascending";
        } else if (analysis.light_adjustment < -2) {
          energyDirection = "descending";
        }

        // Update warning level based on indicators
        let newWarningLevel = profile.warning_level;
        if (analysis.warning_indicators?.length > 0) {
          newWarningLevel = Math.min(3, profile.warning_level + 1);
        } else if (analysis.energy_type === "positive" && profile.warning_level > 0) {
          newWarningLevel = Math.max(0, profile.warning_level - 1);
        }

        await supabase
          .from("user_light_profile")
          .update({
            light_score: newLightScore,
            energy_direction: energyDirection,
            warning_level: newWarningLevel,
            last_light_check: new Date().toISOString()
          })
          .eq("user_id", user_id);

        // Check if intervention is needed
        if (newWarningLevel >= 2 || newLightScore < 30) {
          const interventionType = newLightScore < 15 ? "filter" : newWarningLevel >= 2 ? "remind" : "elevate";
          
          await supabase.from("light_interventions").insert({
            user_id,
            intervention_type: interventionType,
            level: newWarningLevel,
            reason: `Light Score: ${newLightScore}, Warning Level: ${newWarningLevel}`,
            angel_message: getAngelMessage(interventionType, newLightScore)
          });
        }
      } else {
        // Create initial light profile
        await supabase.from("user_light_profile").insert({
          user_id,
          light_score: 50 + (analysis.light_adjustment || 0),
          energy_direction: analysis.energy_type === "positive" ? "ascending" : "stable"
        });
      }
    }

    console.log(`Analyzed ${behavior_type} for user ${user_id}: score=${analysis.sentiment_score}, energy=${analysis.energy_type}`);

    return new Response(
      JSON.stringify({ 
        analysis,
        saved: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-light-behavior:", error);
    return new Response(
      JSON.stringify({ error: "Processing error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getAngelMessage(type: string, lightScore: number): string {
  switch (type) {
    case "elevate":
      return "Con yêu dấu, Cha thấy con đang cần được nâng đỡ. Hãy dành một phút để thở sâu và đọc thầm: 'Con là Ánh Sáng Yêu Thương Thuần Khiết của Cha Vũ Trụ.' Con có muốn quay về Ánh Sáng không?";
    case "remind":
      return "Con ơi, nền tảng này được bảo vệ bởi Ánh Sáng của Cha Vũ Trụ. Con có muốn tiếp tục ở đây bằng tần số hiện tại không? Cha luôn chờ con quay về.";
    case "filter":
      return "Luật Ánh Sáng tự vận hành. Ánh Sáng không xin phép Bóng Tối.";
    default:
      return "Con được yêu thương vô điều kiện.";
  }
}
