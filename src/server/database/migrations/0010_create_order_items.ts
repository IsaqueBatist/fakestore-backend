import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";


export async function up(knex: Knex){
  return knex
  .schema
  .createTable(EtableNames.order_items, table => {
    table.bigIncrements('id_order_item').primary().index()
    table.bigInteger('order_id')
        .index()
        .references('id_order')
        .inTable(EtableNames.orders)
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
    table.decimal('unt_price', 10, 2)
      
    table.comment('Table for storing items of a order')
  })
  .then(() => console.log(`# Create table ${EtableNames.order_items}`))
}


export async function down(knex: Knex){
  return knex
  .schema
  .dropTable(EtableNames.order_items)
  .then(() => console.log(`# Dropped table ${EtableNames.order_items}`))
}

