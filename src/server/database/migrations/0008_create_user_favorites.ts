import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";


export async function up(knex: Knex){
  return knex
  .schema
  .createTable(EtableNames.user_favorites, table => {
    table.bigInteger('user_id')
        .index()
        .references('id_user')
        .inTable(EtableNames.user)
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
    
    table.primary(['user_id', 'product_id']);
    
    table.comment('Table for storing categories of a product')
  })
  .then(() => console.log(`# Create table ${EtableNames.user_favorites}`))
}


export async function down(knex: Knex){
  return knex
  .schema
  .dropTable(EtableNames.user_favorites)
  .then(() => console.log(`# Dropped table ${EtableNames.user_favorites}`))
}

