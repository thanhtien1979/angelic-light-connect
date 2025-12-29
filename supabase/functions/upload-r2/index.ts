import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.18";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  // Video
  "video/mp4",
  "video/webm",
  // Documents
  "application/pdf",
  "text/plain",
];

const ALLOWED_EXTENSIONS = [
  "jpg", "jpeg", "png", "webp", "gif", "svg",
  "mp3", "wav", "ogg", "webm",
  "mp4",
  "pdf", "txt"
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ===== AUTHENTICATION CHECK =====
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
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
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    // ===== RATE LIMITING =====
    const { data: rateLimitOk } = await supabase.rpc("check_rate_limit", {
      p_identifier: user.id,
      p_endpoint: "upload-r2",
      p_max_requests: 20,
      p_window_minutes: 5,
    });

    if (rateLimitOk === false) {
      console.error("Rate limit exceeded for user:", user.id);
      return new Response(
        JSON.stringify({ error: "Too many uploads. Please wait before trying again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== PARSE FORM DATA =====
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "uploads";

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== FILE SIZE VALIDATION =====
    if (file.size > MAX_FILE_SIZE) {
      console.error("File too large:", file.size);
      return new Response(
        JSON.stringify({ error: `File exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== MIME TYPE VALIDATION =====
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.error("Invalid MIME type:", file.type);
      return new Response(
        JSON.stringify({ error: "File type not allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== EXTENSION VALIDATION =====
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      console.error("Invalid extension:", extension);
      return new Response(
        JSON.stringify({ error: "File extension not allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== FOLDER PATH SANITIZATION =====
    const sanitizedFolder = folder
      .replace(/\.\./g, "") // Prevent path traversal
      .replace(/[^a-zA-Z0-9-_/]/g, "") // Only allow safe characters
      .replace(/\/+/g, "/") // Normalize slashes
      .replace(/^\/|\/$/g, ""); // Trim leading/trailing slashes

    // ===== R2 CONFIGURATION =====
    const accessKeyId = Deno.env.get("CLOUDFLARE_R2_ACCESS_KEY_ID");
    const secretAccessKey = Deno.env.get("CLOUDFLARE_R2_SECRET_ACCESS_KEY");
    const bucketName = Deno.env.get("CLOUDFLARE_R2_BUCKET_NAME");
    const endpoint = Deno.env.get("CLOUDFLARE_R2_ENDPOINT");
    const publicUrl = Deno.env.get("CLOUDFLARE_R2_PUBLIC_URL");

    if (!accessKeyId || !secretAccessKey || !bucketName || !endpoint || !publicUrl) {
      console.error("R2 credentials not configured");
      return new Response(
        JSON.stringify({ error: "Storage not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique filename with user_id for access control
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().slice(0, 8);
    const safeExtension = extension || "bin";
    const fileName = `${sanitizedFolder}/${user.id}/${timestamp}-${randomId}.${safeExtension}`;

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to R2 using fetch-based SigV4 signing (Deno-compatible)
    const aws = new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: "s3",
      region: "auto",
    });

    const endpointUrl = new URL(endpoint);
    // Use path-style: /<bucket>/<key>
    endpointUrl.pathname = `/${bucketName}/${fileName}`;

    const uploadRes = await aws.fetch(endpointUrl.toString(), {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: uint8Array,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text().catch(() => "");
      console.error("R2 upload failed:", uploadRes.status, errText);
      return new Response(
        JSON.stringify({ error: "Không thể tải file lên lưu trữ. Vui lòng thử lại." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("File uploaded successfully:", fileName);

    // Construct public URL
    const fileUrl = `${publicUrl.replace(/\/$/, "")}/${fileName}`;

    return new Response(
      JSON.stringify({ 
        url: fileUrl,
        fileName: fileName,
        contentType: file.type,
        size: file.size
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
