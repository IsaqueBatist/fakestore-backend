import type { Knex } from "knex";

/**
 * Adds soft delete (deleted_at) to critical tables and updates RLS policies
 * to filter out soft-deleted rows at the database level.
 *
 * IMPORTANT: Soft delete is enforced via RLS, NOT just application code.
 * This ensures deleted rows are invisible even if Node.js forgets the filter.
 */

const SOFT_DELETE_TABLES = ["product", "orders", "user"] as const;

export async function up(knex: Knex) {
  // 1. Add deleted_at column to each table
  for (const table of SOFT_DELETE_TABLES) {
    await knex.schema.alterTable(table, (t) => {
      t.timestamp("deleted_at").nullable().defaultTo(null);
    });
  }

  // 2. Recreate RLS policies to include deleted_at IS NULL
  for (const table of SOFT_DELETE_TABLES) {
    await knex.raw(`
      DROP POLICY IF EXISTS tenant_isolation_policy ON "${table}";

      CREATE POLICY tenant_isolation_policy ON "${table}"
      USING (
        tenant_id = current_setting('app.current_tenant_id', true)::integer
        AND deleted_at IS NULL
      )
      WITH CHECK (
        tenant_id = current_setting('app.current_tenant_id', true)::integer
      );
    `);
  }

  // 3. Add index for filtering soft-deleted rows efficiently
  for (const table of SOFT_DELETE_TABLES) {
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_${table}_deleted_at ON "${table}" (deleted_at) WHERE deleted_at IS NULL`,
    );
  }

  console.log(
    `# Added soft delete (deleted_at) to: ${SOFT_DELETE_TABLES.join(", ")}`,
  );
}

export async function down(knex: Knex) {
  for (const table of SOFT_DELETE_TABLES) {
    // Restore original RLS policy without deleted_at filter
    await knex.raw(`
      DROP POLICY IF EXISTS tenant_isolation_policy ON "${table}";

      CREATE POLICY tenant_isolation_policy ON "${table}"
      USING (
        tenant_id = current_setting('app.current_tenant_id', true)::integer
      )
      WITH CHECK (
        tenant_id = current_setting('app.current_tenant_id', true)::integer
      );
    `);

    await knex.raw(`DROP INDEX IF EXISTS idx_${table}_deleted_at`);

    await knex.schema.alterTable(table, (t) => {
      t.dropColumn("deleted_at");
    });
  }

  console.log(
    `# Removed soft delete from: ${SOFT_DELETE_TABLES.join(", ")}`,
  );
}
