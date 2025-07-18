import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";


export async function up(knex: Knex){
  return knex
  .schema
  .createTable(EtableNames.cart, table => {
    table.bigIncrements('id_cart').primary().index()
    table.bigInteger('user_id')
        .index()
        .references('id_user')
        .inTable(EtableNames.user)
        .onUpdate('CASCADE')
        .onDelete('NO ACTION')
        .notNullable();
    table.dateTime('created_at').defaultTo(knex.fn.now());
    
    table.comment('Table for storing carts')
  })
  .then(() => console.log(`# Create table ${EtableNames.cart}`))
}


export async function down(knex: Knex){
  return knex
  .schema
  .dropTable(EtableNames.cart)
  .then(() => console.log(`# Dropped table ${EtableNames.cart}`))
}

