import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";

/**
 * Enables Row-Level Security (RLS) on all transactional tables.
 *
 * RLS policies use current_setting('app.current_tenant_id') to automatically
 * filter all SELECT/UPDATE/DELETE operations and validate INSERT/UPDATE data.
 *
 * The EnsureTenant middleware sets this via SET LOCAL before any query.
 *
 * NOTE: The 'tenants' table does NOT have RLS — it's accessed by the
 * middleware before tenant context is established.
 */

const rlsTables = [
  EtableNames.products,
  EtableNames.user,
  EtableNames.categories,
  EtableNames.product_categories,
  EtableNames.product_comments,
  EtableNames.orders,
  EtableNames.order_items,
  EtableNames.addresses,
  EtableNames.user_favorites,
];

export async function up(knex: Knex) {
  for (const table of rlsTables) {
    // Enable RLS on the table
    await knex.raw(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`);

    // FORCE RLS applies even to the table owner (prevents bypass)
    await knex.raw(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY`);

    // Create isolation policy:
    // - USING: filters SELECT, UPDATE, DELETE to only rows matching current tenant
    // - WITH CHECK: validates INSERT and UPDATE set the correct tenant_id
    await knex.raw(`
      CREATE POLICY tenant_isolation_${table.replace(/[^a-z0-9_]/g, "_")} ON "${table}"
        USING (tenant_id = current_setting('app.current_tenant_id', true)::BIGINT)
        WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::BIGINT)
    `);
  }

  console.log("# Enabled RLS policies on all transactional tables");
}

export async function down(knex: Knex) {
  for (const table of rlsTables) {
    await knex.raw(
      `DROP POLICY IF EXISTS tenant_isolation_${table.replace(/[^a-z0-9_]/g, "_")} ON "${table}"`
    );
    await knex.raw(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY`);
  }

  console.log("# Disabled RLS policies on all transactional tables");
}
