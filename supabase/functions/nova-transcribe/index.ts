// Streams a mic recording to Lovable AI /audio/transcriptions and returns { text }.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return new Response(JSON.stringify({ error: "missing_lovable_api_key" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size < 512) {
      return new Response(JSON.stringify({ error: "empty_recording" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Map MIME to extension so the model can decode the container.
    const mime = (file.type || "audio/webm").split(";")[0];
    const ext = ({ "audio/webm": "webm", "audio/mp4": "mp4", "audio/mpeg": "mp3", "audio/wav": "wav", "audio/ogg": "ogg" } as Record<string, string>)[mime] ?? "webm";

    const upstream = new FormData();
    upstream.append("model", "openai/gpt-4o-mini-transcribe");
    upstream.append("file", file, `recording.${ext}`);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: upstream,
    });
    const body = await res.text();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "transcribe_failed", status: res.status, details: body }), { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(body, { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error)?.message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
