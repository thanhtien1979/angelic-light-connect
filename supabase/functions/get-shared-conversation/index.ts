import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory rate limiting as first layer (resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 15; // requests per window (reduced from 30)
const RATE_WINDOW = 60 * 1000; // 1 minute

function isRateLimitedInMemory(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }
  
  if (record.count >= RATE_LIMIT) {
    return true;
  }
  
  record.count++;
  return false;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";

    // First layer: in-memory rate limit check (fast, but resets on cold start)
    if (isRateLimitedInMemory(clientIP)) {
      console.log(`Rate limited (in-memory): ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." }),
        { 
          status: 429, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get share_id from request
    const url = new URL(req.url);
    const shareId = url.searchParams.get("share_id");

    if (!shareId) {
      return new Response(
        JSON.stringify({ error: "share_id là bắt buộc" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate share_id format (should be alphanumeric, reasonable length)
    if (!/^[a-zA-Z0-9_-]{8,64}$/.test(shareId)) {
      return new Response(
        JSON.stringify({ error: "share_id không hợp lệ" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Second layer: database-backed rate limiting (persistent across cold starts)
    const { data: canProceed, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      p_identifier: clientIP,
      p_endpoint: 'get-shared-conversation',
      p_max_requests: 20,
      p_window_minutes: 5
    });

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
      // Continue even if rate limit check fails (don't block legitimate requests)
    } else if (canProceed === false) {
      console.log(`Rate limited (database): ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." }),
        { 
          status: 429, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Use the secure function to get conversation
    const { data, error } = await supabase
      .rpc("get_shared_conversation_by_share_id", { p_share_id: shareId });

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Lỗi khi truy vấn dữ liệu" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: "Không tìm thấy cuộc hội thoại hoặc đã hết hạn" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Return the conversation
    return new Response(
      JSON.stringify({ data: data[0] }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Lỗi server" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
