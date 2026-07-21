import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { encryptForUser, decryptForUser } from "../_shared/byokCrypto.ts";

type Provider = "deepseek" | "openai" | "anthropic";
const PROVIDERS: Provider[] = ["deepseek", "openai", "anthropic"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || "Unauthorized", corsHeaders);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const action = body.action as "get" | "save" | "delete";

    if (action === "get") {
      const { data } = await supabase.from("profiles").select("api_keys").eq("id", user.id).single();
      const stored = (data?.api_keys as Record<string, string>) || {};
      const out: Record<string, string> = {};
      for (const p of PROVIDERS) {
        out[p] = stored[p] ? await decryptForUser(stored[p], user.id) : "";
      }
      return new Response(JSON.stringify({ keys: out }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "save") {
      const provider = body.provider as Provider;
      const value = typeof body.value === "string" ? body.value : "";
      if (!PROVIDERS.includes(provider)) {
        return new Response(JSON.stringify({ error: "Invalid provider" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (value.length > 500) {
        return new Response(JSON.stringify({ error: "Key too long" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: cur } = await supabase.from("profiles").select("api_keys").eq("id", user.id).single();
      const keys = (cur?.api_keys as Record<string, string>) || {};
      if (value) {
        keys[provider] = await encryptForUser(value, user.id);
      } else {
        delete keys[provider];
      }
      const { error } = await supabase.from("profiles").update({ api_keys: keys }).eq("id", user.id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("manage-byok-key error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
