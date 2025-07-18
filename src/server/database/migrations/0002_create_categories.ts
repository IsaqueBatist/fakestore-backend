import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";


export async function up(knex: Knex){
  return knex
  .schema
  .createTable(EtableNames.categories, table => {
    table.bigIncrements('id_category').primary().index(); //Integer que auto inrementa, é primary e indica o index
    table.string('name', 150).notNullable().checkLength('>', 3);
    table.text('description') 
      
    table.comment('Table for storing categories')
  })
  .then(() => console.log(`# Create table ${EtableNames.categories}`))
}


export async function down(knex: Knex){
  return knex
  .schema
  .dropTable(EtableNames.categories)
  .then(() => console.log(`# Dropped table ${EtableNames.categories}`))
}

