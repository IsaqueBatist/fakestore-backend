import type { Knex } from "knex";

export async function up(knex: Knex) {
  return knex.raw(`
    ALTER TABLE "product"
    ADD CONSTRAINT stock_non_negative CHECK (stock >= 0)
  `).then(() => console.log("# Added CHECK constraint: stock_non_negative"));
}

export async function down(knex: Knex) {
  return knex.raw(`
    ALTER TABLE "product"
    DROP CONSTRAINT IF EXISTS stock_non_negative
  `).then(() => console.log("# Dropped CHECK constraint: stock_non_negative"));
}
