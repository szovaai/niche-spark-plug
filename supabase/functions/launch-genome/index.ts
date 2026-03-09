import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateAuth } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const user = await validateAuth(req);
    const { action, projectId, genomeId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    if (action === "extract") {
      // Extract genome from a completed project
      const { data: project, error } = await supabase
        .from("launch_projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

      if (error || !project) {
        return new Response(JSON.stringify({ error: "Project not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const p1 = project.step1_product as any;
      const p3 = project.step3_funnel as any;
      const p4 = project.step4_marketing as any;

      const genome = {
        name: `${project.name} Genome`,
        niche: project.niche || p1?.niche || "General",
        offer_type: p1?.offerType || "starter",
        price_point: p1?.suggestedPrice || 27,
        headline_style: p3?.headline ? detectHeadlineStyle(p3.headline) : "transformation",
        conversion_style: p1?.selectedAngle || "transformation_promise",
        email_style: p4?.emailSequence ? detectEmailStyle(p4.emailSequence) : "story_driven",
        funnel_layout: detectFunnelLayout(project),
        bonus_count: countBonuses(project),
        tags: [project.niche, project.product_type, p1?.selectedAngle].filter(Boolean),
        genome_data: {
          mechanism: p1?.uniqueMechanism,
          angle: p1?.selectedAngle,
          audience: project.target_audience,
          productType: project.product_type,
          offerStack: p1?.offerStack,
          launchScore: p1?.launchScore,
          funnelStructure: p3?.funnelMap,
          emailCount: Array.isArray(p4?.emailSequence) ? p4.emailSequence.length : 0,
          socialPostCount: Array.isArray(p4?.socialPosts) ? p4.socialPosts.length : 0,
        },
        user_id: user.id,
        project_id: projectId,
      };

      const { data: saved, error: saveErr } = await supabase
        .from("launch_genomes")
        .insert(genome)
        .select()
        .single();

      if (saveErr) throw saveErr;

      return new Response(JSON.stringify({ genome: saved }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      const { data, error } = await supabase
        .from("launch_genomes")
        .select("*")
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order("performance_score", { ascending: false })
        .limit(20);

      if (error) throw error;

      return new Response(JSON.stringify({ genomes: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "use") {
      // Increment use count
      await supabase.rpc("increment_genome_uses", { genome_id: genomeId });

      const { data, error } = await supabase
        .from("launch_genomes")
        .select("*")
        .eq("id", genomeId)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ genome: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("launch-genome error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function detectHeadlineStyle(headline: string): string {
  if (!headline) return "transformation";
  const lower = headline.toLowerCase();
  if (lower.includes("how to")) return "how_to";
  if (lower.includes("secret") || lower.includes("discover")) return "curiosity";
  if (lower.includes("step") || lower.includes("system")) return "framework";
  if (lower.includes("without") || lower.includes("never")) return "contrarian";
  return "transformation";
}

function detectEmailStyle(emails: any): string {
  if (!emails || !Array.isArray(emails)) return "story_driven";
  const first = emails[0];
  if (typeof first === "string") return "direct";
  if (first?.type === "story") return "story_driven";
  if (first?.type === "urgency") return "urgency";
  return "story_driven";
}

function detectFunnelLayout(project: any): string {
  const steps = [];
  if (project.step3_funnel) steps.push("sales_page");
  if (project.step1_product) steps.push("checkout");
  if (project.step4_marketing) steps.push("email_sequence");
  steps.push("thank_you");
  return steps.join(" → ");
}

function countBonuses(project: any): number {
  const p1 = project.step1_product as any;
  if (p1?.offerStack?.bonuses && Array.isArray(p1.offerStack.bonuses)) {
    return p1.offerStack.bonuses.length;
  }
  return 0;
}
