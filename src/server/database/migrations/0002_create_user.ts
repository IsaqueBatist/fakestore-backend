import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";


export async function up(knex: Knex){
  return knex
  .schema
  .createTable(EtableNames.user, table => {
    table.bigIncrements('id_user').primary().index(); //Integer que auto inrementa, é primary e indica o index
    table.string('firstName').notNullable().checkLength('>', 3);
    table.string('lastName').notNullable().checkLength('>', 3);
    table.string('email', 50).index().unique().notNullable().checkLength('>', 5);
    table.string('password', 50).notNullable().checkLength('>=', 6);
      
    table.comment('Table for storing users')
  })
  .then(() => console.log(`# Create table ${EtableNames.user}`))
}


export async function down(knex: Knex){
  return knex
  .schema
  .dropTable(EtableNames.user)
  .then(() => console.log(`# Dropped table ${EtableNames.user}`))
}

