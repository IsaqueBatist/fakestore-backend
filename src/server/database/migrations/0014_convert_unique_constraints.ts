import type { Knex } from "knex";
import { EtableNames } from "../ETableNames";

/**
 * Converts single-column UNIQUE constraints to composite (column + tenant_id).
 * This allows the same email to exist under different tenants.
 */

export async function up(knex: Knex) {
  // Drop existing single-column unique constraints on user table
  await knex.raw(
    `ALTER TABLE "${EtableNames.user}" DROP CONSTRAINT IF EXISTS "${EtableNames.user}_email_unique"`,
  );
  await knex.raw(
    `ALTER TABLE "${EtableNames.user}" DROP CONSTRAINT IF EXISTS "${EtableNames.user}_password_reset_token_unique"`,
  );

  // Also drop unique indexes if they exist (Knex may create them as indexes)
  await knex.raw(`DROP INDEX IF EXISTS "${EtableNames.user}_email_unique"`);
  await knex.raw(
    `DROP INDEX IF EXISTS "${EtableNames.user}_password_reset_token_unique"`,
  );

  // Create composite unique indexes
  await knex.schema.alterTable(EtableNames.user, (table) => {
    table.unique(["email", "tenant_id"]);
    table.unique(["password_reset_token", "tenant_id"]);
  });

  console.log(
    "# Converted UNIQUE constraints to composite (column + tenant_id)",
  );
}

export async function down(knex: Knex) {
  // Drop composite unique constraints (IF EXISTS to handle partial rollback)
  await knex.raw(
    `DROP INDEX IF EXISTS "${EtableNames.user}_email_tenant_id_unique"`,
  );
  await knex.raw(
    `DROP INDEX IF EXISTS "${EtableNames.user}_password_reset_token_tenant_id_unique"`,
  );

  // Restore single-column unique constraints
  await knex.schema.alterTable(EtableNames.user, (table) => {
    table.unique(["email"]);
    table.unique(["password_reset_token"]);
  });

  console.log("# Restored single-column UNIQUE constraints");
}
