import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";


export async function up(knex: Knex){
  return knex
  .schema
  .createTable(EtableNames.person, table => {
    table.bigIncrements('id_person').primary().index(); //Integer que auto inrementa, é primary e indica o index
    table.string('firstname').index().notNullable();
    table.string('lastname',).index().notNullable();
    table.string('email', 50).unique().notNullable();
      table.bigInteger('productId')
          .index()
          .notNullable()
          .references('id_product')
          .inTable(EtableNames.products)
          .onUpdate('CASCADE')
          .onDelete('NO ACTION');
      
    table.comment('Table for storing people')
  })
  .then(() => console.log(`# Create table ${EtableNames.person}`))

}


export async function down(knex: Knex){
  return knex
  .schema
  .dropTable(EtableNames.person)
  .then(() => console.log(`# Dropped table ${EtableNames.person}`))
}

