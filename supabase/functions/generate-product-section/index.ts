// M4 — Draft a single product section against the outline + blueprint.
import { createClient } from "npm:@supabase/supabase-js@2";
import { generateText } from "npm:ai";
import { createNovaGateway, getLovableAiGatewayRunId } from "../_shared/novaGateway.ts";
import { NOVA_MODELS } from "../_shared/novaModels.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (s: number, b: unknown) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return json(401, { error: "unauthenticated" });
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes?.user) return json(401, { error: "unauthenticated" });
    const userId = userRes.user.id;

    const { project_id, module_title, section_title, section_summary } = await req.json();
    if (!project_id || !section_title) return json(400, { error: "missing_params" });

    const { data: proj } = await supabase
      .from("business_projects")
      .select("id, user_id")
      .eq("id", project_id)
      .maybeSingle();
    if (!proj || proj.user_id !== userId) return json(403, { error: "forbidden" });

    const { data: bp } = await supabase
      .from("business_blueprints")
      .select("*")
      .eq("project_id", project_id)
      .maybeSingle();

    const { data: reserved, error: resErr } = await supabase.rpc("reserve_task_credits", {
      _project_id: project_id,
      _task_name: "product_section",
      _assigned_agent: "product_builder",
      _cost: 1,
      _input: { section_title },
    });
    if (resErr || !(reserved as { ok?: boolean })?.ok) return json(402, reserved ?? { error: "reservation_failed" });
    const taskId = (reserved as { task_id: string }).task_id;

    try {
      const key = Deno.env.get("LOVABLE_API_KEY");
      if (!key) return json(500, { error: "missing_lovable_api_key" });
      const gateway = createNovaGateway(key, getLovableAiGatewayRunId(req));

      const prompt = `You are Nova's product writer. Write a single section of the "${bp?.product_concept ?? "product"}" for ${bp?.target_audience ?? "the audience"}.

Module: ${module_title ?? "N/A"}
Section: ${section_title}
Focus: ${section_summary ?? "cover the section title thoroughly"}

Style: direct, specific, action-first. No throat-clearing. Use short paragraphs, concrete examples, and bullet lists. Include at least one mini-checklist or step sequence the reader can follow immediately. 500-900 words.

Return the section as clean HTML (h2/h3/p/ul/ol/strong only). Do not include the section number.`;

      const { text } = await generateText({
        model: gateway(NOVA_MODELS.longform),
        prompt,
      });

      await supabase.rpc("finalize_task_credits", { _task_id: taskId, _output: { section_title } });

      return json(200, { ok: true, html: text });
    } catch (err) {
      await supabase.rpc("release_task_credits", { _task_id: taskId, _error: String((err as Error)?.message ?? err) });
      throw err;
    }
  } catch (e) {
    console.error("[generate-product-section]", e);
    return json(500, { error: String((e as Error)?.message ?? e) });
  }
});
