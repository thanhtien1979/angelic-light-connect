import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized - No token provided" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Invalid token:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authentication successful

    const body = await req.json();
    const { prompt, editImage } = body;
    
    // Input validation
    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate prompt length (max 5000 characters to prevent resource exhaustion)
    const MAX_PROMPT_LENGTH = 5000;
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Prompt quá dài. Tối đa ${MAX_PROMPT_LENGTH} ký tự.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate editImage if provided (must be a valid data URL or https URL)
    if (editImage !== undefined && editImage !== null) {
      if (typeof editImage !== "string") {
        return new Response(
          JSON.stringify({ error: "editImage must be a string URL" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Only allow data URLs or https URLs for security
      const isDataUrl = editImage.startsWith("data:image/");
      const isHttpsUrl = editImage.startsWith("https://");
      if (!isDataUrl && !isHttpsUrl) {
        return new Response(
          JSON.stringify({ error: "editImage must be a valid data URL or HTTPS URL" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Limit data URL size (max 10MB base64)
      if (isDataUrl && editImage.length > 10 * 1024 * 1024 * 1.37) {
        return new Response(
          JSON.stringify({ error: "Image quá lớn. Tối đa 10MB." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Sanitize prompt - remove any potentially harmful control characters
    const sanitizedPrompt = prompt.replace(/[\x00-\x1F\x7F]/g, "").trim();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Processing image generation request

    // Build messages array with system prompt to ensure image generation
    const messages: any[] = [
      {
        role: "system",
        content: "You are an image generation AI. You MUST always generate an image in response to the user's request. Never respond with only text. Always produce a visual image output regardless of the prompt language or content. If the prompt is vague, use your creativity to generate a beautiful image."
      }
    ];
    
    if (editImage) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: `Generate/edit this image: ${sanitizedPrompt}` },
          { type: "image_url", image_url: { url: editImage } }
        ]
      });
    } else {
      messages.push({
        role: "user",
        content: `Generate an image: ${sanitizedPrompt}`
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages,
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limit exceeded
        return new Response(
          JSON.stringify({
            error: "Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau.",
            error_code: "RATE_LIMITED",
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        // Payment required
        return new Response(
          JSON.stringify({
            error: "Cần nạp thêm credits. Vui lòng liên hệ admin.",
            error_code: "PAYMENT_REQUIRED",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Lỗi khi tạo hình ảnh", error_code: "AI_GATEWAY_ERROR" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    
    const message = data.choices?.[0]?.message;
    const imageUrl = message?.images?.[0]?.image_url?.url;
    const textContent = message?.content || "";
    const finishReason = data.choices?.[0]?.native_finish_reason || data.choices?.[0]?.finish_reason;

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      
      // Check for content safety rejection
      if (finishReason === "IMAGE_SAFETY" || finishReason === "SAFETY") {
        return new Response(
          JSON.stringify({ 
            error: "Prompt không được chấp nhận bởi hệ thống an toàn. Vui lòng thử với nội dung khác.",
            error_code: "CONTENT_SAFETY"
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Không thể tạo hình ảnh. Vui lòng thử lại với prompt khác." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        imageUrl,
        description: textContent 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-image function:", error);
    return new Response(
      JSON.stringify({ error: "Processing error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
