import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";

export async function up(knex: Knex) {
  await knex.schema.createTable(EtableNames.coupons, (table) => {
    table.bigIncrements("id_coupon").primary();
    table
      .bigInteger("tenant_id")
      .unsigned()
      .notNullable()
      .references("id_tenant")
      .inTable(EtableNames.tenants)
      .onDelete("CASCADE");
    table.string("code", 50).notNullable();
    table
      .enum("discount_type", ["percentage", "fixed"])
      .notNullable()
      .defaultTo("percentage");
    // All monetary values in CENTS (Integer) to avoid floating-point bugs
    // percentage: 1500 = 15.00%, fixed: 1000 = R$10.00
    table.integer("discount_value_cents").notNullable();
    table.integer("min_order_cents").notNullable().defaultTo(0);
    table.integer("max_uses").nullable(); // null = unlimited
    table.integer("current_uses").notNullable().defaultTo(0);
    table.timestamp("starts_at").nullable();
    table.timestamp("expires_at").nullable();
    table.boolean("active").notNullable().defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Unique code per tenant
    table.unique(["tenant_id", "code"]);
    table.index(["tenant_id", "active"], "idx_coupons_tenant_active");
  });

  // Set tenant_id default from RLS context (same as other tables)
  await knex.raw(
    `ALTER TABLE "${EtableNames.coupons}" ALTER COLUMN tenant_id SET DEFAULT current_setting('app.current_tenant_id', true)::BIGINT`,
  );

  // Enable RLS for tenant isolation
  await knex.raw(`
    ALTER TABLE ${EtableNames.coupons} ENABLE ROW LEVEL SECURITY;
    ALTER TABLE ${EtableNames.coupons} FORCE ROW LEVEL SECURITY;

    CREATE POLICY tenant_isolation_policy ON ${EtableNames.coupons}
    USING (tenant_id = current_setting('app.current_tenant_id', true)::integer)
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::integer);
  `);

  console.log(`# Created table ${EtableNames.coupons} with RLS`);
}

export async function down(knex: Knex) {
  await knex.raw(`
    DROP POLICY IF EXISTS tenant_isolation_policy ON ${EtableNames.coupons};
  `);
  await knex.schema.dropTableIfExists(EtableNames.coupons);
  console.log(`# Dropped table ${EtableNames.coupons}`);
}
