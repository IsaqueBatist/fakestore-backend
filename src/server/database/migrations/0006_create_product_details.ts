import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";


export async function up(knex: Knex){
  return knex
  .schema
  .createTable(EtableNames.product_details, table => {
    table.bigIncrements('id_product_details').primary().index() 
    table.bigInteger('product_id')
      .primary()
      .index()
      .references('id_product')
      .inTable(EtableNames.products)
      .onUpdate('CASCADE')
      .onDelete('NO ACTION')
      .notNullable();
    table.decimal('weigth', 10, 2)
    table.string('dimensions', 50)
    table.string('manufacturer', 100)
    table.string('material', 100)
    
    table.comment('Table for storing details of a product')
  })
  .then(() => console.log(`# Create table ${EtableNames.product_details}`))
}


export async function down(knex: Knex){
  return knex
  .schema
  .dropTable(EtableNames.product_details)
  .then(() => console.log(`# Dropped table ${EtableNames.product_details}`))
}

