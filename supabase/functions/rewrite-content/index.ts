import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { MASTER_SYSTEM_PROMPT } from "../_shared/copyPrompts.ts";

const MODE_PROMPTS: Record<string, string> = {
  conversational: `Rewrite to sound like a mentor talking to a friend. Use contractions, short sentences, warm energy. Add "Here's the thing…" and "Quick tip:" style phrases. Remove anything that sounds corporate or robotic.`,
  stories: `Add 2-3 mini-stories with specific names, dollar amounts, and timeframes. Each story should illustrate a key point. Keep the original message but make it vivid with "Last Tuesday, Sarah…" style narratives.`,
  shorten: `Cut this text by 40-50%. Remove redundant ideas, bloated intros, and filler phrases. Keep only the most impactful sentences. Every remaining sentence must teach, show, or tell the reader what to do.`,
  expand: `Expand with 2-3 specific, step-by-step examples. Add exact tools, scripts, or templates the reader can use. Replace vague advice with "Open [tool], click [button], type [this]" level specificity.`,
  deai: `Remove ALL AI-sounding phrases: "leverage", "optimize", "elevate", "in today's landscape", "it is important to note", "furthermore", "moreover", "comprehensive", "harness", "unlock", "game changer", "dive into", "journey", "robust", "seamless". Replace with plain, direct language. "Use" not "utilize". "Improve" not "optimize".`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || "Authentication required", corsHeaders);

    const { text, mode, productTitle, uniqueMechanism } = await req.json();
    if (!text || !mode || !MODE_PROMPTS[mode]) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userTier = await getUserTier(user.id);

    const prompt = `You are a direct-response copy editor.

PRODUCT: ${productTitle || "Unknown"}
MECHANISM: ${uniqueMechanism || ""}

ORIGINAL TEXT:
${text.slice(0, 5000)}

REWRITE INSTRUCTION:
${MODE_PROMPTS[mode]}

Return ONLY the rewritten text. No explanations, no markdown headers, no JSON wrapping. Just the improved text.`;

    const { content } = await callTieredAI([
      { role: "system", content: MASTER_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ], userTier, "standard");

    return new Response(JSON.stringify({ rewritten: content.trim() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Rewrite error:", error);
    const msg = error instanceof Error ? error.message : "Rewrite failed";
    const status = msg.includes("Rate limit") ? 429 : msg.includes("Payment") ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
