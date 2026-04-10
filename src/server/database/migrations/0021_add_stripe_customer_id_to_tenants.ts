import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";

export async function up(knex: Knex) {
  return knex.schema
    .alterTable(EtableNames.tenants, (table) => {
      table.string("stripe_customer_id", 255).nullable();
    })
    .then(() =>
      console.log(
        `# Added stripe_customer_id to ${EtableNames.tenants}`,
      ),
    );
}

export async function down(knex: Knex) {
  return knex.schema
    .alterTable(EtableNames.tenants, (table) => {
      table.dropColumn("stripe_customer_id");
    })
    .then(() =>
      console.log(
        `# Dropped stripe_customer_id from ${EtableNames.tenants}`,
      ),
    );
}
