import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";


export async function up(knex: Knex){
  return knex
  .schema
  .createTable(EtableNames.cart_items, table => {
    table.bigIncrements('id_cart_item').primary().index()
    table.bigInteger('cart_id')
        .index()
        .references('id_cart')
        .inTable(EtableNames.cart)
        .onUpdate('CASCADE')
        .onDelete('NO ACTION')
        .notNullable();
      
    table.bigInteger('product_id')
        .index()
        .references('id_product')
        .inTable(EtableNames.products)
        .onUpdate('CASCADE')
        .onDelete('NO ACTION')
        .notNullable();
    
    table.integer('quantity')
    table.dateTime('added_at').defaultTo(knex.fn.now())
      
    table.comment('Table for storing items of a order')
  })
  .then(() => console.log(`# Create table ${EtableNames.cart_items}`))
}


export async function down(knex: Knex){
  return knex
  .schema
  .dropTable(EtableNames.cart_items)
  .then(() => console.log(`# Dropped table ${EtableNames.cart_items}`))
}

