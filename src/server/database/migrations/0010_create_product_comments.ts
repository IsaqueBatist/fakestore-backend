import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";


export async function up(knex: Knex){
  return knex
  .schema
  .createTable(EtableNames.product_comments, table => {
    table.bigIncrements('id_product_comment').primary().index()
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
    
    table.text('comment')
    table.dateTime('created_at').defaultTo(knex.fn.now())
    
    table.comment('Table for storing comments of a product')
  })
  .then(() => console.log(`# Create table ${EtableNames.product_comments}`))
}


export async function down(knex: Knex){
  return knex
  .schema
  .dropTable(EtableNames.product_comments)
  .then(() => console.log(`# Dropped table ${EtableNames.product_comments}`))
}

