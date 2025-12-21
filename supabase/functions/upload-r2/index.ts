import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { S3Client, PutObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.600.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "uploads";

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Initialize S3 client for R2
    const s3Client = new S3Client({
      region: "auto",
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().slice(0, 8);
    const extension = file.name.split(".").pop() || "bin";
    const fileName = `${folder}/${timestamp}-${randomId}.${extension}`;

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: uint8Array,
      ContentType: file.type,
    });

    await s3Client.send(command);

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
