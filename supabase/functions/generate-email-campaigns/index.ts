// Generate a full email campaign for a project + optionally repurpose each email
// into short-form social content. Persists to public.email_campaigns.
import { createClient } from "npm:@supabase/supabase-js@2";
import { generateText } from "npm:ai";
import { createNovaGateway, getLovableAiGatewayRunId } from "../_shared/novaGateway.ts";
import { NOVA_MODELS } from "../_shared/novaModels.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

type CampaignType =
  | "origin_story"
  | "insight"
  | "launch"
  | "value"
  | "welcome"
  | "reengagement";

const COUNTS: Record<CampaignType, number> = {
  origin_story: 5,
  insight: 7,
  launch: 7,
  value: 5,
  welcome: 3,
  reengagement: 5,
};

const FRAMEWORK: Record<CampaignType, string> = {
  origin_story:
    "5-email origin-story nurture. Arc: (1) the moment things broke, (2) the failed fix, (3) the accidental discovery, (4) the reframe, (5) soft bridge to the offer.",
  insight:
    "7-email insight sequence. Each email reframes a limiting belief the audience holds, ends with a one-line lesson, and closes with a soft nudge toward the offer.",
  launch:
    "7-email launch sequence. Arc: (1) Setup / Announcement, (2) Origin, (3) Big Idea, (4) Offer Reveal, (5) Objections, (6) Social Proof, (7) Final Call / Deadline.",
  value:
    "5-email post-purchase sequence that celebrates the buyer, deepens the win, teaches one advanced move, invites referrals, and sets up the next offer.",
  welcome:
    "3-email welcome sequence: (1) warm intro + expectation, (2) fast win, (3) invitation to engage or buy the entry-tier offer.",
  reengagement:
    "5-email re-engagement sequence for cold lists. Pattern: pattern-interrupt, honest check-in, fresh angle, high-value gift, final goodbye.",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseJson<T>(text: string): T | null {
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

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
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes.user) return json(401, { error: "unauthenticated" });
    const userId = userRes.user.id;

    const body = await req.json().catch(() => ({}));
    const campaignType = body.campaign_type as CampaignType;
    const projectId = (body.project_id ?? null) as string | null;
    const repurpose = body.repurpose !== false; // default true
    if (!COUNTS[campaignType]) return json(400, { error: "invalid_campaign_type" });

    // Pull project + founder context for on-brand voice.
    let projectCtx = "";
    if (projectId) {
      const { data: proj } = await supabase
        .from("business_projects")
        .select("project_name, current_stage")
        .eq("id", projectId)
        .maybeSingle();
      if (proj) {
        projectCtx = `Project: ${proj.project_name ?? ""}\nStage: ${proj.current_stage ?? ""}`;
      }
    }
    const { data: founder } = await supabase
      .from("founder_profiles")
      .select("preferred_name, brand_tone, audience")
      .eq("user_id", userId)
      .maybeSingle();
    const founderCtx = founder
      ? `Founder: ${founder.preferred_name ?? ""}. Brand tone: ${founder.brand_tone ?? "warm + direct"}. Audience: ${founder.audience ?? ""}`
      : "";

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) return json(500, { error: "missing_lovable_api_key" });
    const gateway = createNovaGateway(lovableApiKey, getLovableAiGatewayRunId(req));
    const model = gateway(NOVA_MODELS.blueprint);

    const count = COUNTS[campaignType];
    const prompt = `You are Nova, a direct-response email strategist. Write a ${count}-email ${campaignType.replace(
      "_",
      " ",
    )} campaign.

Framework: ${FRAMEWORK[campaignType]}

Context:
${founderCtx}
${projectCtx}

Rules:
- Conversational, one idea per paragraph, short lines.
- No AI clichés ("leverage", "unlock", "elevate", "in today's world").
- Every email: subject (<50 chars), preview_text (<90 chars), body_text (150-350 words, plain text with \\n\\n between paragraphs), cta (one crisp action line).
- Number emails 1..${count}.
${
  repurpose
    ? `- For each email also produce repurposed_content with: x_thread (5-tweet thread joined by "\\n---\\n"), linkedin_post (~120 words, professional), facebook_post (~90 words), instagram_caption (~80 words + 5 hashtags), tiktok_hook (1-2 sentence hook + 3-bullet script), youtube_short (30-second script).`
    : "- Omit repurposed_content."
}

Return STRICT JSON only, no prose:
{
  "emails": [
    {
      "email_number": 1,
      "subject": "...",
      "preview_text": "...",
      "body_text": "...",
      "cta": "...",
      "repurposed_content": { "x_thread": "...", "linkedin_post": "...", "facebook_post": "...", "instagram_caption": "...", "tiktok_hook": "...", "youtube_short": "..." }
    }
  ]
}`;

    const result = await generateText({ model, prompt });
    const parsed = parseJson<{ emails: Array<Record<string, unknown>> }>(result.text);
    if (!parsed?.emails?.length) {
      return json(502, { error: "generation_failed", raw: result.text.slice(0, 400) });
    }

    // Persist via service role so RLS doesn't require re-verifying user_id.
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Clear prior campaign of same type for this project to keep things tidy.
    await admin
      .from("email_campaigns")
      .delete()
      .eq("user_id", userId)
      .eq("campaign_type", campaignType)
      .eq("project_id", projectId);

    const rows = parsed.emails.map((e, idx) => {
      const bodyText = String(e.body_text ?? "");
      return {
        user_id: userId,
        project_id: projectId,
        campaign_type: campaignType,
        email_number: Number(e.email_number ?? idx + 1),
        subject: String(e.subject ?? `Email ${idx + 1}`).slice(0, 200),
        preview_text: e.preview_text ? String(e.preview_text).slice(0, 200) : null,
        body_text: bodyText,
        body_html: `<div style="white-space:pre-wrap;line-height:1.6">${bodyText
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</div>`,
        cta: e.cta ? String(e.cta).slice(0, 240) : null,
        status: "draft" as const,
        repurposed_content: (e.repurposed_content ?? {}) as Record<string, unknown>,
      };
    });

    const { data: inserted, error: insErr } = await admin
      .from("email_campaigns")
      .insert(rows)
      .select("*");
    if (insErr) return json(500, { error: insErr.message });

    return json(200, { emails: inserted });
  } catch (e) {
    console.error("[generate-email-campaigns]", e);
    return json(500, { error: (e as Error).message });
  }
});
