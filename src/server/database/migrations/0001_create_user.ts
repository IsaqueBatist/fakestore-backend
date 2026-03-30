import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";

export async function up(knex: Knex) {
  return knex.schema
    .createTable(EtableNames.user, (table) => {
      table.bigIncrements("id_user").primary().index(); //Integer que auto inrementa, é primary e indica o index
      table.string("name", 150).notNullable().checkLength(">", 3);
      table.string("email", 150).index().unique().notNullable();
      table.string("password_hash").notNullable();
      table.string("role").defaultTo("user");
      table.dateTime("created_at").defaultTo(knex.fn.now());
      table.string("password_reset_token", 64).unique().index().nullable();
      table.dateTime("password_reset_expires").nullable();

      table.comment("Table for storing users");
    })
    .then(() => console.log(`# Create table ${EtableNames.user}`));
}

export async function down(knex: Knex) {
  return knex.schema
    .dropTable(EtableNames.user)
    .then(() => console.log(`# Dropped table ${EtableNames.user}`));
}
