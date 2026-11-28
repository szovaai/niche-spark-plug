import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

// Read-only integration tests: assert actual deployed grants, not copies of SQL text.
function query(sql: string) {
  return JSON.parse(execFileSync("lovable", ["supabase", "query", sql, "--json"], { encoding: "utf8" })).rows[0];
}
describe("Live credit mutation permissions", () => {
  it("denies all legacy credit mutations to signed-in browsers", () => {
    expect(query(`SELECT has_function_privilege('authenticated','public.reserve_task_credits(uuid,text,text,integer,jsonb)','EXECUTE') AS reserve, has_function_privilege('authenticated','public.finalize_task_credits(uuid,jsonb)','EXECUTE') AS finalize, has_function_privilege('authenticated','public.release_task_credits(uuid,text)','EXECUTE') AS release`)).toEqual({ reserve: false, finalize: false, release: false });
  }, 30000);
  it("allows the new task lifecycle only to the server", () => {
    expect(query(`SELECT has_function_privilege('authenticated','public.finalize_task_credits_for_user(uuid,uuid,jsonb)','EXECUTE') AS browser, has_function_privilege('service_role','public.finalize_task_credits_for_user(uuid,uuid,jsonb)','EXECUTE') AS server, has_function_privilege('anon','public.reserve_task_credits_for_user(uuid,uuid,text,text,integer,jsonb)','EXECUTE') AS anonymous`)).toEqual({ browser: false, server: true, anonymous: false });
  }, 30000);
  it("denies browser changes to task prices, states and results", () => {
    expect(query(`SELECT has_table_privilege('authenticated','public.nova_tasks','INSERT') AS insert, has_table_privilege('authenticated','public.nova_tasks','UPDATE') AS update, has_table_privilege('authenticated','public.nova_tasks','DELETE') AS delete`)).toEqual({ insert: false, update: false, delete: false });
  }, 30000);
});