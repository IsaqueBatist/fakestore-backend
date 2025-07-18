import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";


export async function up(knex: Knex){
  return knex
  .schema
  .createTable(EtableNames.addresses, table => {
    table.bigIncrements('id_adresses').primary().index()
    table.bigInteger('user_id')
        .index()
        .references('id_user')
        .inTable(EtableNames.user)
        .onUpdate('CASCADE')
        .onDelete('NO ACTION')
        .notNullable();
    table.string('street', 150 )
    table.string('city', 150 )
    table.string('state', 150 )
    table.string('zip_code', 150 )
    table.string('country', 150 )
    
    table.comment('Table for storing addresses of users')
  })
  .then(() => console.log(`# Create table ${EtableNames.addresses}`))
}


export async function down(knex: Knex){
  return knex
  .schema
  .dropTable(EtableNames.addresses)
  .then(() => console.log(`# Dropped table ${EtableNames.addresses}`))
}

