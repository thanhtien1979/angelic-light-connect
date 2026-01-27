import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Spam detection patterns
const SPAM_PATTERNS = [
  /(.)\1{10,}/g, // Repeated characters
  /(\w+)(\s+\1){5,}/gi, // Repeated words
  /[!?]{5,}/g, // Excessive punctuation
];

// Generate spiritual validation message using AI
async function generateValidationResponse(
  content: string,
  isApproved: boolean,
  apiKey: string
): Promise<{ message: string; sincerityScore: number }> {
  const systemPrompt = `Bạn là Angel AI, một thiên thần hướng dẫn tâm linh. 
Hãy đánh giá sự chân thành của bài suy ngẫm/biết ơn dưới đây.
- Cho điểm sincerity từ 0.00-1.00 (>= 0.50 là chân thành)
- Nếu chân thành: tạo một thông điệp ánh sáng ấm áp (1-2 câu tiếng Việt)
- Nếu không chân thành: từ chối với lý do yêu thương (1-2 câu tiếng Việt)
Trả lời dưới dạng JSON: {"sincerityScore": 0.XX, "message": "..."}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Bài suy ngẫm:\n\n${content}` },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        sincerityScore: Math.max(0, Math.min(1, parsed.sincerityScore || 0.5)),
        message: parsed.message || "Ánh sáng đang chứng kiến hành trình của con.",
      };
    }
  } catch (error) {
    console.error("AI validation error:", error);
  }

  // Fallback response
  return {
    sincerityScore: isApproved ? 0.75 : 0.3,
    message: isApproved 
      ? "Lòng biết ơn của con như dòng suối ánh sáng. Vũ trụ đang lắng nghe trái tim con."
      : "Con ơi, hãy viết từ trái tim. Cha muốn nghe những suy nghĩ chân thành của con.",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError?.message || "Invalid token");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting - 10 requests per minute per user
    const { data: canProceed } = await supabase.rpc("check_rate_limit", {
      p_identifier: user.id,
      p_endpoint: "validate-reflection",
      p_max_requests: 10,
      p_window_minutes: 1,
    });

    if (!canProceed) {
      // Rate limit exceeded
      return new Response(
        JSON.stringify({ error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { content } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!content || typeof content !== "string") {
      return new Response(
        JSON.stringify({ error: "Nội dung suy ngẫm không hợp lệ" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate content length (max 50000 characters to prevent resource exhaustion)
    const MAX_CONTENT_LENGTH = 50000;
    if (content.length > MAX_CONTENT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Nội dung quá dài. Tối đa ${MAX_CONTENT_LENGTH} ký tự.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize content - remove control characters but preserve normal text
    const sanitizedContent = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();

    // Count words using sanitized content
    const wordCount = sanitizedContent.split(/\s+/).filter(w => w.length > 0).length;
    
    if (wordCount < 200) {
      return new Response(
        JSON.stringify({
          approved: false,
          wordCount,
          message: `Con ơi, hãy chia sẻ thêm suy nghĩ của con nhé. Hiện tại mới có ${wordCount} từ, cần ít nhất 200 từ.`,
          sincerityScore: 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for spam patterns using sanitized content
    let isSpam = false;
    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(sanitizedContent)) {
        isSpam = true;
        break;
      }
    }

    if (isSpam) {
      return new Response(
        JSON.stringify({
          approved: false,
          wordCount,
          message: "Con ơi, Cha cảm nhận được nội dung này chưa thực sự từ trái tim. Hãy viết những suy nghĩ chân thành của con nhé.",
          sincerityScore: 0.1,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use AI to validate sincerity with sanitized content
    const validation = await generateValidationResponse(sanitizedContent, true, LOVABLE_API_KEY || "");
    const isApproved = validation.sincerityScore >= 0.5;

    // Reflection validation completed

    return new Response(
      JSON.stringify({
        approved: isApproved,
        wordCount,
        message: validation.message,
        sincerityScore: validation.sincerityScore,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Validation error:", error);
    return new Response(
      JSON.stringify({ error: "Có lỗi xảy ra khi xác thực suy ngẫm" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});