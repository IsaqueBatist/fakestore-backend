import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";

/**
 * Stores idempotency keys to prevent duplicate processing of mutation operations.
 * Keys expire after 24 hours.
 */
export async function up(knex: Knex) {
  return knex.schema
    .createTable(EtableNames.idempotency_keys, (table) => {
      table.bigIncrements("id_key").primary();
      table
        .bigInteger("tenant_id")
        .notNullable()
        .index()
        .references("id_tenant")
        .inTable(EtableNames.tenants)
        .onUpdate("CASCADE")
        .onDelete("NO ACTION");
      table.string("idempotency_key", 255).notNullable();
      table.integer("response_code").notNullable();
      table.text("response_body").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.unique(["tenant_id", "idempotency_key"]);

      table.comment("Idempotency keys for mutation operations");
    })
    .then(() => console.log(`# Create table ${EtableNames.idempotency_keys}`));
}

export async function down(knex: Knex) {
  return knex.schema
    .dropTable(EtableNames.idempotency_keys)
    .then(() =>
      console.log(`# Dropped table ${EtableNames.idempotency_keys}`),
    );
}
