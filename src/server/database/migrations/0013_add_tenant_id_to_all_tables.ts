import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";

/**
 * Adds tenant_id to all transactional tables for multi-tenancy support.
 *
 * Strategy:
 * 1. Add tenant_id as NULLABLE
 * 2. Create a default tenant and backfill existing rows
 * 3. ALTER to NOT NULL
 * 4. Add FK constraints
 * 5. Add composite indexes
 * 6. Set DEFAULT to auto-populate from session context (RLS integration)
 */

const transactionalTables = [
  { table: EtableNames.products, pk: "id_product" },
  { table: EtableNames.user, pk: "id_user" },
  { table: EtableNames.categories, pk: "id_category" },
  { table: EtableNames.orders, pk: "id_order" },
  { table: EtableNames.order_items, pk: "id_order_item" },
  { table: EtableNames.addresses, pk: "id_address" },
  { table: EtableNames.product_comments, pk: "id_product_comment" },
];

// Junction tables (composite PKs, no single PK column)
const junctionTables = [
  EtableNames.product_categories,
  EtableNames.user_favorites,
];

export async function up(knex: Knex) {
  // 1. Add tenant_id as NULLABLE to all tables
  for (const { table } of transactionalTables) {
    await knex.schema.alterTable(table, (t) => {
      t.bigInteger("tenant_id").nullable();
    });
  }
  for (const table of junctionTables) {
    await knex.schema.alterTable(table, (t) => {
      t.bigInteger("tenant_id").nullable();
    });
  }

  // 2. Create default tenant for backfill of existing data
  const [defaultTenant] = await knex(EtableNames.tenants)
    .insert({
      name: "Default Tenant",
      slug: "default",
      api_key_hash: "0".repeat(64),
      api_secret_hash: "placeholder",
      plan: "basic",
      rate_limit: 10,
      is_active: true,
    })
    .returning("id_tenant");

  const defaultTenantId = defaultTenant.id_tenant;

  // 3. Backfill existing rows with default tenant
  for (const { table } of transactionalTables) {
    await knex(table).whereNull("tenant_id").update({ tenant_id: defaultTenantId });
  }
  for (const table of junctionTables) {
    await knex(table).whereNull("tenant_id").update({ tenant_id: defaultTenantId });
  }

  // 4. ALTER to NOT NULL and add FK constraints + indexes
  for (const { table, pk } of transactionalTables) {
    await knex.schema.alterTable(table, (t) => {
      t.bigInteger("tenant_id").notNullable().alter();
      t.foreign("tenant_id")
        .references("id_tenant")
        .inTable(EtableNames.tenants)
        .onUpdate("CASCADE")
        .onDelete("NO ACTION");
      t.index(["tenant_id", pk]);
    });
  }
  for (const table of junctionTables) {
    await knex.schema.alterTable(table, (t) => {
      t.bigInteger("tenant_id").notNullable().alter();
      t.foreign("tenant_id")
        .references("id_tenant")
        .inTable(EtableNames.tenants)
        .onUpdate("CASCADE")
        .onDelete("NO ACTION");
      t.index(["tenant_id"]);
    });
  }

  // 5. Set DEFAULT to auto-populate from RLS session context
  // This ensures INSERT statements don't need to manually specify tenant_id
  const allTables = [
    ...transactionalTables.map((t) => t.table),
    ...junctionTables,
  ];
  for (const table of allTables) {
    await knex.raw(
      `ALTER TABLE "${table}" ALTER COLUMN tenant_id SET DEFAULT current_setting('app.current_tenant_id', true)::BIGINT`
    );
  }

  console.log("# Added tenant_id to all transactional tables");
}

export async function down(knex: Knex) {
  const allTables = [
    ...transactionalTables.map((t) => t.table),
    ...junctionTables,
  ];

  for (const table of allTables) {
    // Remove DEFAULT (IF EXISTS to handle partial rollback)
    await knex.raw(
      `ALTER TABLE "${table}" ALTER COLUMN tenant_id DROP DEFAULT`
    ).catch(() => {});

    // Drop FK if it still exists (globalSetup may have already dropped it)
    const fk = `${table}_tenant_id_foreign`;
    await knex.raw(
      `ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${fk}"`
    );

    await knex.schema.alterTable(table, (t) => {
      t.dropColumn("tenant_id");
    });
  }

  // Remove default tenant
  await knex(EtableNames.tenants).where("slug", "default").del();

  console.log("# Removed tenant_id from all transactional tables");
}
