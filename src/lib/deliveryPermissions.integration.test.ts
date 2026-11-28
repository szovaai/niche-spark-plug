import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
function query(sql: string) {
  return JSON.parse(execFileSync('lovable', ['supabase', 'query', sql, '--json'], { encoding: 'utf8' })).rows[0];
}
describe('Live delivery grants', () => {
  for (const table of ['delivery_packages', 'delivery_orders']) {
    it(`${table}: browsers cannot create, alter, or delete fulfillment records`, () => {
      expect(query(`SELECT has_table_privilege('authenticated','public.${table}','INSERT') AS insert, has_table_privilege('authenticated','public.${table}','UPDATE') AS update, has_table_privilege('authenticated','public.${table}','DELETE') AS delete, has_table_privilege('anon','public.${table}','SELECT') AS anonymous, has_table_privilege('service_role','public.${table}','INSERT') AS server`)).toEqual({ insert: false, update: false, delete: false, anonymous: false, server: true });
    }, 30000);
  }
});