import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";

/**
 * Audit log for webhook delivery attempts.
 * Retry logic is handled by BullMQ (Redis), not this table.
 */
export async function up(knex: Knex) {
  return knex.schema
    .createTable(EtableNames.webhook_events, (table) => {
      table.bigIncrements("id_event").primary().index();
      table
        .bigInteger("tenant_id")
        .notNullable()
        .index()
        .references("id_tenant")
        .inTable(EtableNames.tenants)
        .onUpdate("CASCADE")
        .onDelete("NO ACTION");
      table.string("event_type", 100).notNullable().index();
      table.text("payload").notNullable();
      table.string("status", 50).notNullable().defaultTo("pending");
      table.integer("attempts").notNullable().defaultTo(0);
      table.timestamp("last_attempt_at").nullable();
      table.integer("response_code").nullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.comment("Audit log for webhook delivery attempts");
    })
    .then(() => console.log(`# Create table ${EtableNames.webhook_events}`));
}

export async function down(knex: Knex) {
  return knex.schema
    .dropTable(EtableNames.webhook_events)
    .then(() => console.log(`# Dropped table ${EtableNames.webhook_events}`));
}
