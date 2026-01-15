import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Angel AI Agent ID - You'll need to create this in ElevenLabs dashboard
// For now, we'll use the API to get a conversation token
const ELEVENLABS_AGENT_ID = Deno.env.get("ELEVENLABS_AGENT_ID");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      console.error("Missing ElevenLabs configuration: ELEVENLABS_API_KEY");
      return json({ error: "Server configuration error" }, 500);
    }

    if (!ELEVENLABS_AGENT_ID) {
      console.error("Missing ElevenLabs configuration: ELEVENLABS_AGENT_ID");
      return json({ error: "Server configuration error" }, 500);
    }

    console.log("Fetching conversation token for agent:", ELEVENLABS_AGENT_ID);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${ELEVENLABS_AGENT_ID}`,
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      // SECURITY: Don't return upstream error details to the client.
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      return json({ error: "Failed to get conversation token" }, 502);
    }

    const data = await response.json();
    console.log("Successfully obtained conversation token");

    return json({ token: data.token });
  } catch (error) {
    console.error("Conversation token error:", error);
    return new Response(JSON.stringify({ error: "Processing error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
