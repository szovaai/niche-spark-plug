import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { validateAuth } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AgentAnalysis {
  agentId: string;
  agentName: string;
  status: "healthy" | "warning" | "weak" | "inactive";
  score: number;
  insights: Array<{ text: string; type: "success" | "warning" | "info"; priority: number }>;
  recommendations: string[];
}

function analyzeProjectLocally(project: any): AgentAnalysis[] {
  const p1 = project.step1_product;
  const p2 = project.step2_product_content;
  const p2a = project.step2_assets;
  const p3 = project.step3_funnel;
  const p4 = project.step4_marketing;
  const p5 = project.step5_checklist;

  const agents: AgentAnalysis[] = [
    {
      agentId: "opportunity",
      agentName: "Opportunity Agent",
      status: p1 ? "healthy" : "inactive",
      score: p1 ? 85 : 0,
      insights: p1
        ? [{ text: `Niche "${project.niche || 'unset'}" identified. Product concept ready.`, type: "success", priority: 1 }]
        : [{ text: "No product idea generated yet. Start with the Product Builder.", type: "warning", priority: 1 }],
      recommendations: p1
        ? ["Validate demand with Opportunity Radar", "Check competitor pricing"]
        : ["Use Opportunity Radar to find profitable niches", "Try the Research Agent for idea validation"],
    },
    {
      agentId: "product-architect",
      agentName: "Product Architect",
      status: p2 ? "healthy" : p1 ? "warning" : "inactive",
      score: p2 ? 90 : p1 ? 40 : 0,
      insights: p2
        ? [{ text: "Product content generated and structured.", type: "success", priority: 1 }]
        : p1
        ? [{ text: "Product idea exists but content not yet built.", type: "warning", priority: 1 }]
        : [{ text: "Waiting for product idea before designing content.", type: "info", priority: 3 }],
      recommendations: p2
        ? ["Add bonus modules to increase perceived value", "Consider adding a quick-start guide"]
        : ["Generate product content in the Launch Wizard"],
    },
    {
      agentId: "asset-builder",
      agentName: "Asset Builder",
      status: p2a && Object.keys(p2a).length > 1 ? "healthy" : p1 ? "warning" : "inactive",
      score: p2a && Object.keys(p2a).length > 1 ? 80 : 0,
      insights: p2a && Object.keys(p2a).length > 1
        ? [{ text: `${Object.keys(p2a).length} assets generated for your product.`, type: "success", priority: 2 }]
        : [{ text: "Product assets not yet created. Generate checklists, templates, and worksheets.", type: "warning", priority: 2 }],
      recommendations: p2a && Object.keys(p2a).length > 1
        ? ["Create additional bonus assets to stack value"]
        : ["Generate assets in Step 3 of the Launch Wizard"],
    },
    {
      agentId: "copy-architect",
      agentName: "Copy Architect",
      status: p3 ? "healthy" : p1 ? "warning" : "inactive",
      score: p3 ? 82 : 0,
      insights: p3
        ? [
            { text: "Sales copy generated for your funnel.", type: "success", priority: 1 },
            { text: "Consider A/B testing your headline for higher conversions.", type: "info", priority: 2 },
          ]
        : [{ text: "No sales copy generated yet. Build your funnel to activate.", type: "warning", priority: 1 }],
      recommendations: p3
        ? ["Strengthen your headline with a specific timeframe", "Add urgency with a deadline or limited spots"]
        : ["Generate funnel copy in Step 4 of the wizard"],
    },
    {
      agentId: "email-campaign",
      agentName: "Email Campaign Agent",
      status: p4 ? "healthy" : p3 ? "warning" : "inactive",
      score: p4 ? 78 : 0,
      insights: p4
        ? [{ text: "Email sequences ready for launch.", type: "success", priority: 2 }]
        : p3
        ? [{ text: "Funnel ready but no email campaigns created yet.", type: "warning", priority: 1 }]
        : [{ text: "Build your funnel first, then generate email campaigns.", type: "info", priority: 3 }],
      recommendations: p4
        ? ["Add a 'cart abandonment' follow-up sequence", "Test subject lines with curiosity hooks"]
        : ["Generate marketing assets in Step 5"],
    },
    {
      agentId: "viral-content",
      agentName: "Viral Content Agent",
      status: p4 ? "healthy" : "inactive",
      score: p4 ? 75 : 0,
      insights: p4
        ? [{ text: "Social content assets ready for promotion.", type: "success", priority: 2 }]
        : [{ text: "Generate marketing assets to unlock viral content strategies.", type: "info", priority: 3 }],
      recommendations: p4
        ? ["Create 5 TikTok-style hooks for your product", "Build a Pinterest pin series"]
        : ["Complete your marketing assets first"],
    },
    {
      agentId: "funnel-architect",
      agentName: "Funnel Architect",
      status: p3 ? "healthy" : "inactive",
      score: p3 ? 84 : 0,
      insights: p3
        ? [
            { text: "Funnel structure is active and optimized.", type: "success", priority: 1 },
            { text: "Adding an order bump could increase AOV by 15-30%.", type: "info", priority: 2 },
          ]
        : [{ text: "No funnel structure detected. Build one to start converting.", type: "warning", priority: 1 }],
      recommendations: p3
        ? ["Add a downsell for declined upsells", "Consider adding a webinar funnel layer"]
        : ["Build your funnel in the Launch Wizard"],
    },
    {
      agentId: "simulation",
      agentName: "Simulation Agent",
      status: p3 ? "healthy" : "inactive",
      score: p3 ? 76 : 0,
      insights: p3
        ? [{ text: "Revenue projections available based on funnel data.", type: "success", priority: 2 }]
        : [{ text: "Complete your funnel to run launch simulations.", type: "info", priority: 3 }],
      recommendations: p3
        ? ["Run a simulation with 1,000 visitors to baseline", "Test different price points"]
        : ["Build your funnel first"],
    },
    {
      agentId: "affiliate",
      agentName: "Affiliate Agent",
      status: p3 && p4 ? "healthy" : "inactive",
      score: p3 && p4 ? 72 : 0,
      insights: p3 && p4
        ? [{ text: "Affiliate program ready. Predicted EPC looks strong.", type: "success", priority: 2 }]
        : [{ text: "Complete funnel and marketing to activate affiliate analysis.", type: "info", priority: 3 }],
      recommendations: p3 && p4
        ? ["Set commission at 50%+ to attract top affiliates", "Create affiliate swipe copy"]
        : ["Complete your launch assets first"],
    },
    {
      agentId: "learning",
      agentName: "Learning Agent",
      status: "healthy",
      score: 60,
      insights: [
        { text: "Analyzing launch patterns across your projects.", type: "info", priority: 3 },
      ],
      recommendations: ["Complete more launches to improve AI recommendations", "Track your conversion data for better predictions"],
    },
  ];

  return agents;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userId, error: authError } = await validateAuth(req);
    if (authError || !userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { project, useAI = false } = await req.json();
    
    // Always do local analysis first (fast, free)
    const localAnalysis = analyzeProjectLocally(project);
    
    // If AI enhancement requested and project has enough data
    if (useAI && project.step1_product) {
      try {
        const userTier = await getUserTier(userId);
        const projectSummary = JSON.stringify({
          niche: project.niche,
          product: project.step1_product?.title || project.name,
          hasContent: !!project.step2_product_content,
          hasAssets: !!(project.step2_assets && Object.keys(project.step2_assets).length > 1),
          hasFunnel: !!project.step3_funnel,
          hasMarketing: !!project.step4_marketing,
          price: project.step1_product?.price || project.step1_product?.fePrice || 17,
          targetAudience: project.target_audience,
        });

        const { content } = await callTieredAI([
          {
            role: "system",
            content: `You are an expert launch strategist AI. Analyze the project data and provide 3-5 specific, actionable insights to improve the launch. Focus on what's weak and what would have the highest impact. Be direct, specific, and avoid generic advice. Format as JSON array: [{"agentId":"opportunity|copy-architect|funnel-architect|simulation|affiliate","text":"insight","type":"info|warning|success","priority":1}]`,
          },
          { role: "user", content: `Analyze this launch project:\n${projectSummary}` },
        ], userTier, "standard");

        // Try to parse AI insights and merge them
        try {
          const match = content.match(/\[[\s\S]*\]/);
          if (match) {
            const aiInsights = JSON.parse(match[0]);
            for (const insight of aiInsights) {
              const agent = localAnalysis.find(a => a.agentId === insight.agentId);
              if (agent) {
                agent.insights.push({ text: insight.text, type: insight.type || "info", priority: insight.priority || 2 });
              }
            }
          }
        } catch (e) {
          console.warn("Could not parse AI insights:", e);
        }
      } catch (e) {
        console.warn("AI enhancement failed, using local analysis:", e);
      }
    }

    return new Response(JSON.stringify({ agents: localAnalysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Agent analyze error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
