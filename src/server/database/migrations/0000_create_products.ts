import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";


export async function up(knex: Knex){
  return knex
  .schema
  .createTable(EtableNames.products, table => {
    table.bigIncrements('id_product').primary().index(); //Integer que auto inrementa, é primary e indica o index
    table.string('name', 150).index().notNullable();
    table.text('description');
    table.decimal('price', 10, 2).notNullable();
    table.string('image_url').notNullable();
    table.decimal('rating', 10, 2).notNullable();
    table.dateTime('created_at').defaultTo(knex.fn.now());
    
    table.comment('Table for storing product')
  })
  .then(() => console.log(`# Create table ${EtableNames.products}`))

}


export async function down(knex: Knex){
  return knex
  .schema
  .dropTable(EtableNames.products)
  .then(() => console.log(`# Dropped table ${EtableNames.products}`))
}

