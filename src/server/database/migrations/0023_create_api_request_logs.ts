import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";

export async function up(knex: Knex) {
  return knex.schema
    .createTable(EtableNames.api_request_logs, (table) => {
      table.bigIncrements("id_log").primary();
      table
        .bigInteger("tenant_id")
        .unsigned()
        .notNullable()
        .references("id_tenant")
        .inTable(EtableNames.tenants)
        .onDelete("CASCADE");
      table.bigInteger("user_id").unsigned().nullable();
      table.string("method", 10).notNullable();
      table.string("path", 500).notNullable();
      table.integer("status_code").notNullable();
      table.integer("duration_ms").notNullable();
      table.jsonb("request_body").nullable();
      table.jsonb("response_body").nullable();
      table.string("ip_address", 45).nullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.index(["tenant_id", "created_at"], "idx_api_logs_tenant_created");
    })
    .then(() =>
      console.log(`# Created table ${EtableNames.api_request_logs}`),
    );
}

export async function down(knex: Knex) {
  return knex.schema
    .dropTableIfExists(EtableNames.api_request_logs)
    .then(() =>
      console.log(`# Dropped table ${EtableNames.api_request_logs}`),
    );
}
