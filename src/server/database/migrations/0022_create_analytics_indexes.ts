import type { Knex } from "knex";

export async function up(knex: Knex) {
  await knex.schema.raw(
    "CREATE INDEX IF NOT EXISTS idx_orders_tenant_created ON orders (tenant_id, created_at DESC)",
  );
  await knex.schema.raw(
    "CREATE INDEX IF NOT EXISTS idx_orders_tenant_status ON orders (tenant_id, status)",
  );
  console.log("# Created analytics indexes on orders");
}

export async function down(knex: Knex) {
  await knex.schema.raw("DROP INDEX IF EXISTS idx_orders_tenant_created");
  await knex.schema.raw("DROP INDEX IF EXISTS idx_orders_tenant_status");
  console.log("# Dropped analytics indexes on orders");
}
