import type { Knex } from "knex";

// Migration stub — the product_details table was removed from the project.
// This file exists only to satisfy Knex's migration history validation.

export async function up(knex: Knex): Promise<void> {
  // no-op
}

export async function down(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable("product_details")) {
    await knex.schema.dropTable("product_details");
  }
}
