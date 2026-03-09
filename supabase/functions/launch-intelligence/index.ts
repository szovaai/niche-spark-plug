import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { validateInput, validationErrorResponse } from "../_shared/validate.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const body = await req.json();
    const { valid, error: valError, data } = validateInput(body, [
      { field: 'mode', type: 'string', required: true, maxLength: 30 },
      { field: 'projectId', type: 'string', maxLength: 100 },
      { field: 'productDNA', type: 'object', maxLength: 10000 },
      { field: 'feedback', type: 'object', maxLength: 5000 },
      { field: 'niche', type: 'string', maxLength: 200 },
      { field: 'productType', type: 'string', maxLength: 100 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { mode } = data;
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // MODE: save-dna — store product DNA after a build
    if (mode === "save-dna") {
      const { projectId, productDNA } = data;
      if (!productDNA) throw new Error("productDNA required");

      const { error } = await supabaseAdmin.from("launch_intelligence").insert({
        user_id: user.id,
        project_id: projectId || null,
        niche: productDNA.niche,
        topic: productDNA.topic,
        target_audience: productDNA.targetAudience,
        product_type: productDNA.productType,
        price_point: productDNA.price || 17,
        mechanism_name: productDNA.mechanismName,
        headline_style: productDNA.headlineStyle,
        sales_style: productDNA.salesStyle,
        email_sequence_type: productDNA.emailSequenceType,
        offer_structure: productDNA.offerStructure || {},
        bonus_count: productDNA.bonusCount || 0,
        hooks_used: productDNA.hooksUsed || [],
        copy_tone: productDNA.copyTone,
        platform: productDNA.platform || "warriorplus",
        blueprint_tags: productDNA.blueprintTags || [],
      });

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // MODE: save-feedback — update performance feedback
    if (mode === "save-feedback") {
      const { feedback, projectId } = data;
      if (!feedback) throw new Error("feedback required");

      // Find intelligence record by project_id
      const { data: existing } = await supabaseAdmin
        .from("launch_intelligence")
        .select("id")
        .eq("user_id", user.id)
        .eq("project_id", projectId)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin.from("launch_intelligence").update({
          performance_rating: feedback.rating || "not_rated",
          sales_count: feedback.salesCount,
          click_through_rate: feedback.clickThroughRate,
          email_open_rate: feedback.emailOpenRate,
          affiliate_interest: feedback.affiliateInterest,
          social_engagement: feedback.socialEngagement,
          notes: feedback.notes,
        }).eq("id", existing.id);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // MODE: get-insights — analyze patterns and return insights
    if (mode === "get-insights") {
      const { data: builds } = await supabaseAdmin
        .from("launch_intelligence")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!builds || builds.length === 0) {
        return new Response(JSON.stringify({
          totalBuilds: 0,
          insights: [],
          topPatterns: [],
          recommendation: null,
          creatorProfile: null,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Basic analytics
      const totalBuilds = builds.length;
      const ratedBuilds = builds.filter(b => b.performance_rating && b.performance_rating !== "not_rated");
      const goodBuilds = ratedBuilds.filter(b => ["good", "excellent"].includes(b.performance_rating!));

      // Find patterns
      const nicheCount: Record<string, number> = {};
      const typeCount: Record<string, number> = {};
      const pricePoints: number[] = [];
      const mechanisms: string[] = [];

      builds.forEach(b => {
        if (b.niche) nicheCount[b.niche] = (nicheCount[b.niche] || 0) + 1;
        if (b.product_type) typeCount[b.product_type] = (typeCount[b.product_type] || 0) + 1;
        if (b.price_point) pricePoints.push(Number(b.price_point));
        if (b.mechanism_name) mechanisms.push(b.mechanism_name);
      });

      const topNiche = Object.entries(nicheCount).sort((a, b) => b[1] - a[1])[0];
      const topType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0];
      const avgPrice = pricePoints.length ? Math.round(pricePoints.reduce((a, b) => a + b, 0) / pricePoints.length) : 17;

      const creatorProfile = {
        totalBuilds,
        ratedBuilds: ratedBuilds.length,
        successRate: ratedBuilds.length > 0 ? Math.round((goodBuilds.length / ratedBuilds.length) * 100) : null,
        topNiche: topNiche ? topNiche[0] : null,
        topProductType: topType ? topType[0] : null,
        avgPricePoint: avgPrice,
        favoritePlatform: builds[0]?.platform || "warriorplus",
        mechanismsUsed: mechanisms.length,
      };

      // If enough data, use AI to generate deeper insights
      let aiInsights = null;
      if (totalBuilds >= 3) {
        const userTier = await getUserTier(user.id);
        const buildSummary = builds.slice(0, 20).map(b => ({
          niche: b.niche,
          type: b.product_type,
          price: b.price_point,
          mechanism: b.mechanism_name,
          rating: b.performance_rating,
          salesStyle: b.sales_style,
          platform: b.platform,
        }));

        const { content } = await callTieredAI([
          { role: "system", content: "You are a digital product launch strategist. Analyze the user's build history and provide actionable insights. Be specific and data-driven." },
          { role: "user", content: `Analyze these ${totalBuilds} product builds and provide strategic insights:\n\n${JSON.stringify(buildSummary, null, 2)}\n\nReturn ONLY valid JSON:\n{\n  "patterns": ["Pattern 1", "Pattern 2", "Pattern 3"],\n  "strengths": ["Strength 1", "Strength 2"],\n  "opportunities": ["Opportunity 1", "Opportunity 2"],\n  "nextProductSuggestion": {\n    "niche": "suggested niche",\n    "productType": "suggested type",\n    "pricePoint": 27,\n    "mechanismName": "suggested mechanism",\n    "headlineStyle": "curiosity|authority|result",\n    "reasoning": "Why this would work based on their history"\n  },\n  "warningPatterns": ["Any risky patterns to avoid"]\n}` },
        ], userTier, "simple");

        try {
          const match = content.match(/\{[\s\S]*\}/);
          if (match) aiInsights = JSON.parse(match[0]);
        } catch { /* ignore parse errors */ }
      }

      return new Response(JSON.stringify({
        totalBuilds,
        creatorProfile,
        insights: aiInsights,
        recentBuilds: builds.slice(0, 10).map(b => ({
          id: b.id,
          projectId: b.project_id,
          niche: b.niche,
          productType: b.product_type,
          mechanismName: b.mechanism_name,
          price: b.price_point,
          rating: b.performance_rating,
          platform: b.platform,
          createdAt: b.created_at,
        })),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // MODE: get-recommendation — smart pre-fill for new build
    if (mode === "get-recommendation") {
      const { niche, productType } = data;
      const { data: builds } = await supabaseAdmin
        .from("launch_intelligence")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (!builds || builds.length < 2) {
        return new Response(JSON.stringify({ hasRecommendation: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const userTier = await getUserTier(user.id);
      const goodBuilds = builds.filter(b => ["good", "excellent"].includes(b.performance_rating || ""));
      const buildContext = (goodBuilds.length >= 2 ? goodBuilds : builds).slice(0, 10);

      const { content } = await callTieredAI([
        { role: "system", content: "You are a launch intelligence agent. Based on the user's successful past builds, recommend an optimized product structure for their next launch. Be specific and actionable." },
        { role: "user", content: `User wants to build a new product${niche ? ` in the "${niche}" niche` : ""}${productType ? ` (type: ${productType})` : ""}.\n\nTheir past successful builds:\n${JSON.stringify(buildContext.map(b => ({ niche: b.niche, type: b.product_type, price: b.price_point, mechanism: b.mechanism_name, rating: b.performance_rating, style: b.sales_style })), null, 2)}\n\nReturn ONLY valid JSON:\n{\n  "hasRecommendation": true,\n  "confidence": "high|medium|low",\n  "suggestedNiche": "niche if not provided",\n  "suggestedTopic": "specific product topic",\n  "suggestedAudience": "target audience description",\n  "suggestedMechanism": "unique mechanism name",\n  "suggestedPrice": 27,\n  "suggestedHeadlineStyle": "curiosity|authority|result|contrarian",\n  "suggestedSalesStyle": "warriorplus|longform|short",\n  "blueprintName": "Name for this winning blueprint",\n  "reasoning": "2-3 sentences explaining why this structure will work based on their history",\n  "estimatedSuccessRate": "high|medium"\n}` },
      ], userTier, "simple");

      try {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          return new Response(match[0], {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      } catch { /* fall through */ }

      return new Response(JSON.stringify({ hasRecommendation: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    throw new Error("Invalid mode");
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
