// Text-to-speech proxy. POST { text, voice? } -> audio/mpeg bytes.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return new Response(JSON.stringify({ error: "missing_lovable_api_key" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { text, voice } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text_required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    // Cap length to avoid huge TTS bills / long waits.
    const input = text.slice(0, 2000);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input,
        voice: voice || "sage",
        response_format: "mp3",
        instructions: "Warm, confident, calm coach. Conversational. Not corporate.",
      }),
    });
    if (!res.ok) {
      const details = await res.text();
      return new Response(JSON.stringify({ error: "tts_failed", status: res.status, details }), { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(res.body, { status: 200, headers: { ...corsHeaders, "Content-Type": "audio/mpeg" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error)?.message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
