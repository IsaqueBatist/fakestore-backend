import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";

export async function up(knex: Knex) {
  return knex.schema
    .createTable(EtableNames.tenants, (table) => {
      table.bigIncrements("id_tenant").primary().index();
      table.string("name", 150).notNullable();
      table.string("slug", 100).notNullable().unique();
      table.string("api_key_hash", 64).notNullable().unique().index();
      table.string("api_secret_hash", 255).notNullable();
      table.string("plan", 50).notNullable().defaultTo("sandbox");
      table.string("webhook_url", 500).nullable();
      table.string("webhook_secret", 255).nullable();
      table.integer("rate_limit").notNullable().defaultTo(2);
      table.boolean("is_active").notNullable().defaultTo(true);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());

      table.comment("Table for storing tenant (merchant) configurations");
    })
    .then(() => console.log(`# Create table ${EtableNames.tenants}`));
}

export async function down(knex: Knex) {
  return knex.schema
    .dropTable(EtableNames.tenants)
    .then(() => console.log(`# Dropped table ${EtableNames.tenants}`));
}
