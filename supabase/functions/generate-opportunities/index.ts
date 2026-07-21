// Generate 3-5 evidence-based niche opportunities for a project.
// Uses founder profile as context, stores shortlist in nova_tasks.output_json.
import { createClient } from "npm:@supabase/supabase-js@2";
import { generateText, Output } from "npm:ai";
import { z } from "npm:zod";
import { createNovaGateway, getLovableAiGatewayRunId } from "../_shared/novaGateway.ts";
import { NOVA_MODELS } from "../_shared/novaModels.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const OpportunitySchema = z.object({
  opportunities: z.array(
    z.object({
      niche: z.string(),
      audience: z.string(),
      problem: z.string(),
      product_idea: z.string(),
      why_now: z.string(),
      monetization: z.string(),
      demand_score: z.number(),
      competition_score: z.number(),
      fit_score: z.number(),
      monetization_score: z.number(),
      evidence: z.array(z.string()),
    }),
  ),
});

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

    const body = await req.json();
    const projectId: string | undefined = body?.project_id;
    if (!projectId) return json(400, { error: "missing_project_id" });

    // Ownership check
    const { data: proj } = await supabase
      .from("business_projects")
      .select("id, user_id, project_name")
      .eq("id", projectId)
      .maybeSingle();
    if (!proj || proj.user_id !== userId) return json(403, { error: "forbidden" });

    // Reserve credits (2)
    const { data: reserved, error: reserveErr } = await supabase.rpc("reserve_task_credits", {
      _project_id: projectId,
      _task_name: "opportunity_shortlist",
      _assigned_agent: "opportunity_engine",
      _cost: 2,
      _input: { project_id: projectId },
    });
    if (reserveErr || !(reserved as { ok?: boolean })?.ok) {
      return json(402, reserved ?? { error: "reservation_failed" });
    }
    const taskId = (reserved as { task_id: string }).task_id;

    try {
      const { data: profile } = await supabase
        .from("founder_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      const profileText = profile
        ? `Preferred name: ${profile.preferred_name}\nInterests: ${(profile.interests ?? []).join(", ")}\nExperience: ${profile.experience}\nAudience interest: ${profile.audience}\nGoals: ${profile.goals}\nWeekly hours: ${profile.weekly_hours}\nBudget: ${profile.budget_band}\nOn camera: ${profile.camera_comfort}\nExisting audience: ${profile.has_audience}`
        : "No founder profile yet.";

      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableKey) return json(500, { error: "missing_lovable_api_key" });
      const gateway = createNovaGateway(lovableKey, getLovableAiGatewayRunId(req));

      const prompt = `You are Nova's opportunity researcher. Return 4 niche opportunities tailored to this founder for a small digital product they can launch solo.

FOUNDER CONTEXT:
${profileText}

For each opportunity:
- niche: specific and tight (not "fitness" — "strength training for perimenopausal women")
- audience: one sentence describing them
- problem: the concrete recurring pain
- product_idea: a specific first product (PDF, toolkit, playbook, template pack, mini-course)
- why_now: evidence-backed reason demand exists in 2026
- monetization: pricing and delivery model
- Scores 0-100: demand_score (real observable demand), competition_score (100 = wide open, 0 = saturated), fit_score (match to founder profile), monetization_score (willingness to pay)
- evidence: 2-3 specific proof points (subreddit, YouTube channel type, search volume category, marketplace presence). Be honest — if you're estimating, say "estimated".

Prefer niches where the founder's interests and experience overlap with paying audiences. Avoid vague creator/general-productivity niches unless the founder clearly fits.`;

      const { output } = await generateText({
        model: gateway(NOVA_MODELS.blueprint),
        output: Output.object({ schema: OpportunitySchema }),
        prompt,
      });

      await supabase.rpc("finalize_task_credits", { _task_id: taskId, _output: output });

      // Auto-mark M1 "run_opportunity_research" task done
      await supabase.from("mission_tasks").upsert(
        {
          project_id: projectId,
          user_id: userId,
          mission_id: "m1",
          task_key: "run_opportunity_research",
          label: "Run opportunity research",
          status: "done",
          approved_at: new Date().toISOString(),
        } as never,
        { onConflict: "project_id,mission_id,task_key" },
      );

      return json(200, { ok: true, task_id: taskId, ...output });
    } catch (err) {
      await supabase.rpc("release_task_credits", {
        _task_id: taskId,
        _error: String((err as Error)?.message ?? err),
      });
      throw err;
    }
  } catch (e) {
    console.error("[generate-opportunities] error", e);
    return json(500, { error: String((e as Error)?.message ?? e) });
  }
});
