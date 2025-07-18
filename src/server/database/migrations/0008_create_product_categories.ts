import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";


export async function up(knex: Knex){
  return knex
  .schema
  .createTable(EtableNames.product_categories, table => {
    table.bigInteger('product_id')
      .index()
      .references('id_product')
      .inTable(EtableNames.products)
      .onUpdate('CASCADE')
      .onDelete('NO ACTION')
      .notNullable();
    
    table.bigInteger('category_id')
      .index()
      .references('id_category')
      .inTable(EtableNames.categories)
      .onUpdate('CASCADE')
      .onDelete('NO ACTION')
      .notNullable();
    
     table.primary(['product_id', 'category_id']);

    table.comment('Table for storing categories of a product')
  })
  .then(() => console.log(`# Create table ${EtableNames.product_categories}`))
}


export async function down(knex: Knex){
  return knex
  .schema
  .dropTable(EtableNames.product_categories)
  .then(() => console.log(`# Dropped table ${EtableNames.product_categories}`))
}

