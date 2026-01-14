import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map Vietnamese voice IDs to ElevenLabs voice IDs with voice settings
const VOICE_MAPPING: Record<string, { voiceId: string; stability: number; similarity: number; style: number; speed: number }> = {
  // Female voices - using different ElevenLabs voices with different settings
  'female-north-young': { voiceId: 'EXAVITQu4vr4xnSDxMaL', stability: 0.4, similarity: 0.8, style: 0.5, speed: 1.05 }, // Sarah - young energetic
  'female-north-middle': { voiceId: 'FGY2WhTYpPnrIDTdsKH5', stability: 0.6, similarity: 0.75, style: 0.3, speed: 0.95 }, // Laura - mature
  'female-south-young': { voiceId: 'pFZP5JQG7iQjIQuC4Bku', stability: 0.35, similarity: 0.85, style: 0.6, speed: 1.1 }, // Lily - lively
  'female-south-middle': { voiceId: 'XrExE9yKIg1WjnnlVkGX', stability: 0.55, similarity: 0.7, style: 0.4, speed: 0.9 }, // Matilda - warm
  'female-central-young': { voiceId: 'cgSgspJ2msm6clMCkdW9', stability: 0.45, similarity: 0.8, style: 0.5, speed: 1.0 }, // Jessica - clear
  'female-neutral-old': { voiceId: 'Xb7hH8MSUJpSbSDYk0k2', stability: 0.7, similarity: 0.65, style: 0.2, speed: 0.85 }, // Alice - gentle elderly
  
  // Male voices
  'male-north-young': { voiceId: 'TX3LPaxmHKxFdv7VOQHJ', stability: 0.45, similarity: 0.8, style: 0.5, speed: 1.0 }, // Liam - young
  'male-north-middle': { voiceId: 'onwK4e9ZLuTAKqWW03F9', stability: 0.6, similarity: 0.75, style: 0.3, speed: 0.95 }, // Daniel - mature
  'male-south-young': { voiceId: 'iP95p4xoKVk53GoZ742B', stability: 0.4, similarity: 0.85, style: 0.6, speed: 1.05 }, // Chris - energetic
  'male-south-middle': { voiceId: 'bIHbv24MWmeRgasZH58o', stability: 0.55, similarity: 0.7, style: 0.35, speed: 0.9 }, // Will - warm
  'male-central-young': { voiceId: 'cjVigY5qzO86Huf0OWal', stability: 0.5, similarity: 0.8, style: 0.45, speed: 1.0 }, // Eric - clear
  'male-neutral-old': { voiceId: 'nPczCjzI2devNBz1zQrb', stability: 0.7, similarity: 0.6, style: 0.2, speed: 0.8 }, // Brian - wise elderly
  
  // Angel voices - special ethereal settings
  'angel-female': { voiceId: 'EXAVITQu4vr4xnSDxMaL', stability: 0.65, similarity: 0.9, style: 0.7, speed: 0.92 }, // Sarah with ethereal
  'angel-male': { voiceId: 'JBFqnCBsd6RMkjVDRZzb', stability: 0.65, similarity: 0.9, style: 0.65, speed: 0.92 }, // George with ethereal
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId, userSpeed = 1.0, userPitch = 1.0 } = await req.json();
    
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    
    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get voice configuration or use default
    const voiceConfig = VOICE_MAPPING[voiceId] || VOICE_MAPPING['angel-female'];
    
    // Calculate final speed with user adjustment
    const finalSpeed = Math.max(0.7, Math.min(1.2, voiceConfig.speed * userSpeed));

    console.log(`TTS Request: voice=${voiceId}, elevenLabsVoice=${voiceConfig.voiceId}, speed=${finalSpeed}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.substring(0, 5000), // Limit text length
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: voiceConfig.stability,
            similarity_boost: voiceConfig.similarity,
            style: voiceConfig.style,
            use_speaker_boost: true,
            speed: finalSpeed,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate speech", details: errorText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    
    console.log(`TTS Success: generated ${audioBuffer.byteLength} bytes`);

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("TTS Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
