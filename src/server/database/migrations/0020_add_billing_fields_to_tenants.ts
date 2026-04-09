import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";

export async function up(knex: Knex) {
  return knex.schema
    .alterTable(EtableNames.tenants, (table) => {
      table.string("subscription_id", 255).nullable();
      table.string("billing_email", 255).nullable();
      table.timestamp("plan_expires_at").nullable();
      table.timestamp("trial_ends_at").nullable();
      table.integer("grace_period_days").notNullable().defaultTo(7);
    })
    .then(() =>
      console.log(`# Added billing fields to ${EtableNames.tenants}`),
    );
}

export async function down(knex: Knex) {
  return knex.schema
    .alterTable(EtableNames.tenants, (table) => {
      table.dropColumn("subscription_id");
      table.dropColumn("billing_email");
      table.dropColumn("plan_expires_at");
      table.dropColumn("trial_ends_at");
      table.dropColumn("grace_period_days");
    })
    .then(() =>
      console.log(`# Dropped billing fields from ${EtableNames.tenants}`),
    );
}
