import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";


export async function up(knex: Knex){
  return knex
  .schema
  .createTable(EtableNames.orders, table => {
    table.bigIncrements('id_order').primary().index()
    table.bigInteger('user_id')
        .index()
        .references('id_user')
        .inTable(EtableNames.user)
        .onUpdate('CASCADE')
        .onDelete('NO ACTION')
        .notNullable();
    
    table.decimal('total', 10, 2).notNullable()
    table.string('status', 50).notNullable().defaultTo('pending')
    table.dateTime('created_at').defaultTo(knex.fn.now());
    
    table.comment('Table for storing orders')
  })
  .then(() => console.log(`# Create table ${EtableNames.orders}`))
}


export async function down(knex: Knex){
  return knex
  .schema
  .dropTable(EtableNames.orders)
  .then(() => console.log(`# Dropped table ${EtableNames.orders}`))
}

