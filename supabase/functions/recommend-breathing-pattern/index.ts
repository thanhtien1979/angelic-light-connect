import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PatternRecommendationRequest {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  recentPatterns: string[];
  totalSessions: number;
  averageDuration: number;
  emotionalContext?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the JWT token using getClaims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabase.auth.getClaims(token);

    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { timeOfDay, recentPatterns, totalSessions, averageDuration, emotionalContext } = 
      await req.json() as PatternRecommendationRequest;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context for the AI
    const practiceContext = totalSessions > 0 
      ? `They have completed ${totalSessions} breathing sessions with an average duration of ${averageDuration} minutes. Their recently used patterns are: ${recentPatterns.slice(0, 3).join(', ') || 'none'}.`
      : `This is a new practitioner just beginning their breathing journey.`;

    const emotionalNote = emotionalContext 
      ? `Recent emotional context from their reflections: "${emotionalContext}"`
      : '';

    const systemPrompt = `You are a gentle spiritual guide helping users with mindful breathing practice. 
You recommend breathing patterns based on the time of day and the user's practice history.
Always respond in a calm, supportive, non-judgmental tone.
Never use performance language, scores, or competitive framing.
Your recommendations should feel like gentle invitations, not prescriptions.

Available breathing patterns:
1. "Gentle Wave" - Soft rhythm like ocean waves (4s inhale, 6s exhale) - Good for relaxation
2. "Calm Rest" - Deep relaxation and grounding (4s inhale, 7s hold, 8s exhale) - Good for deep calm, evening
3. "Inner Balance" - Equal rhythm for centered stillness (4s each: inhale, hold, exhale, hold) - Good for focus, balance
4. "Peaceful Flow" - Smooth inhale and exhale harmony (5s inhale, 5s exhale) - Good for beginners, any time
5. "Soft Release" - Longer exhale for gentle letting go (3s inhale, 6s exhale) - Good for stress relief, anxiety`;

    const userPrompt = `It is currently ${timeOfDay}. ${practiceContext} ${emotionalNote}

Recommend the most suitable breathing pattern for this moment. Respond with a JSON object containing:
- patternId: one of "gentle-wave", "calm-rest", "inner-balance", "peaceful-flow", "soft-release"
- reason: A gentle, spiritual one-sentence reason (max 20 words) explaining why this pattern suits them right now
- greeting: A warm, brief greeting acknowledging the time of day (max 15 words)`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_pattern",
              description: "Recommend a breathing pattern for the user",
              parameters: {
                type: "object",
                properties: {
                  patternId: {
                    type: "string",
                    enum: ["gentle-wave", "calm-rest", "inner-balance", "peaceful-flow", "soft-release"],
                    description: "The ID of the recommended breathing pattern"
                  },
                  reason: {
                    type: "string",
                    description: "A gentle, spiritual reason for the recommendation (max 20 words)"
                  },
                  greeting: {
                    type: "string",
                    description: "A warm greeting acknowledging the time of day (max 15 words)"
                  }
                },
                required: ["patternId", "reason", "greeting"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "recommend_pattern" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const recommendation = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(recommendation), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback if tool call parsing fails
    return new Response(JSON.stringify({
      patternId: "peaceful-flow",
      reason: "A balanced rhythm to gently guide your breath.",
      greeting: "Welcome to this moment of stillness.",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Pattern recommendation error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      // Provide fallback recommendation
      patternId: "peaceful-flow",
      reason: "A balanced rhythm to gently guide your breath.",
      greeting: "Welcome to this moment of stillness.",
    }), {
      status: 200, // Return 200 with fallback so UI can still function
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
