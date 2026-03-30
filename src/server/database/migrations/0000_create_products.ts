import { Knex } from "knex";
import { EtableNames } from "../ETableNames";

export async function up(knex: Knex) {
  return knex.schema
    .createTable(EtableNames.products, (table) => {
      // Restauração de BIGINT (64-bits) para compatibilidade com as Foreign Keys.
      table.bigIncrements("id_product").primary().index();

      table.string("name", 150).notNullable();
      table.text("description").notNullable();
      table.decimal("price", 10, 2).notNullable();
      table.integer("stock").notNullable();
      table.string("image_url", 255).notNullable();
      table.decimal("rating", 10, 2).notNullable();

      table.jsonb("specifications").nullable();

      table.timestamps(true, true);
    })
    .then(() => console.log(`# Create table ${EtableNames.products}`));
}

export async function down(knex: Knex) {
  return knex.schema
    .dropTable(EtableNames.products)
    .then(() => console.log(`# Dropped table ${EtableNames.products}`));
}
