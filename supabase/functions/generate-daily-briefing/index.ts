import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || "Authentication required", corsHeaders);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch user's projects
    const { data: projects } = await supabase
      .from("launch_projects")
      .select("id, name, status, current_step, niche, updated_at, step1_product, step2_product_content, step3_funnel, step4_marketing, step5_checklist")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(10);

    const userTier = await getUserTier(user.id);

    const projectSummaries = (projects || []).map(p => {
      const daysSinceUpdate = Math.floor((Date.now() - new Date(p.updated_at).getTime()) / 86400000);
      return `- "${p.name}" (${p.niche || "no niche"}) — Step ${p.current_step}/6, status: ${p.status}, last touched ${daysSinceUpdate}d ago. Has: ${p.step1_product ? "✓product" : "✗product"} ${p.step2_product_content ? "✓content" : "✗content"} ${p.step3_funnel ? "✓funnel" : "✗funnel"} ${p.step4_marketing ? "✓marketing" : "✗marketing"} ${p.step5_checklist ? "✓checklist" : "✗checklist"}`;
    }).join("\n");

    const prompt = `You are an AI launch coach for digital product creators. Based on this user's project state, generate a personalized daily briefing.

USER'S PROJECTS:
${projectSummaries || "No projects yet."}

TODAY'S DATE: ${new Date().toISOString().split("T")[0]}

Generate exactly 3 prioritized actions for today. Each action should be specific, achievable in 15-30 minutes, and move the needle on their launch.

Return ONLY valid JSON:
{
  "greeting": "Short personalized greeting (1 sentence)",
  "actions": [
    { "title": "Action title (5-8 words)", "description": "Specific instruction (2-3 sentences)", "projectId": "uuid or null", "projectName": "name or null", "priority": "high|medium|low", "estimatedMinutes": 15, "link": "/wizard or /funnels etc" },
    { "title": "...", "description": "...", "projectId": null, "projectName": null, "priority": "medium", "estimatedMinutes": 20, "link": "/wizard" },
    { "title": "...", "description": "...", "projectId": null, "projectName": null, "priority": "low", "estimatedMinutes": 10, "link": "/assets" }
  ],
  "motivationalNote": "One sentence of encouragement based on their progress"
}`;

    const { content } = await callTieredAI([
      { role: "user", content: prompt },
    ], userTier, "simple");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse briefing");
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Briefing error:", error);
    const msg = error instanceof Error ? error.message : "Briefing failed";
    const status = msg.includes("Rate limit") ? 429 : msg.includes("Payment") ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
