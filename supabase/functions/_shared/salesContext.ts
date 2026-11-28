import { createClient } from "npm:@supabase/supabase-js@2";
import { loadSalesContext, SalesContextError } from "./salesIntelligence.ts";
export { SALES_TRUTH_RULES, salesCacheKey } from "./salesIntelligence.ts";

export async function resolveSalesContext(req: Request, userId: string, body: unknown, cors: Record<string, string>) {
  try {
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new SalesContextError(400, "invalid_request_body");
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_ANON_KEY");
    const authorization = req.headers.get("authorization");
    if (!url || !key) throw new SalesContextError(503, "business_context_unavailable");
    if (!authorization) throw new SalesContextError(401, "unauthenticated");
    // Caller-scoped client: RLS plus explicit owner filters, never a service-role profile read.
    const client = createClient(url, key, { global: { headers: { Authorization: authorization } } });
    return await loadSalesContext({
      async project(owner, projectId) {
        let query = client.from("business_projects").select("id, project_name").eq("user_id", owner);
        if (projectId) query = query.eq("id", projectId);
        const { data, error } = await query.order("updated_at", { ascending: false }).limit(1).maybeSingle();
        if (error) throw new SalesContextError(503, "business_context_unavailable");
        return data;
      },
      async blueprint(owner, projectId) {
        const { data, error } = await client.from("business_blueprints")
          .select("business_name,niche,target_audience,customer_problem,desired_outcome,product_concept,product_promise,offer_summary,price,bonuses,order_bump,upsell,downsell,brand_voice,sales_profile")
          .eq("user_id", owner).eq("project_id", projectId).maybeSingle();
        if (error) throw new SalesContextError(503, "business_context_unavailable");
        return data;
      },
    }, userId, body as Record<string, unknown>);
  } catch (error) {
    const status = error instanceof SalesContextError ? error.status : 503;
    const message = error instanceof SalesContextError ? error.message : "business_context_unavailable";
    return new Response(JSON.stringify({ error: message }), { status, headers: { ...cors, "Content-Type": "application/json" } });
  }
}