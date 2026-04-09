import type { Knex } from "knex";

export async function up(knex: Knex) {
  // 1. Add tsvector column
  await knex.raw(`
    ALTER TABLE "product"
    ADD COLUMN search_vector tsvector
  `);

  // 2. Backfill existing rows
  await knex.raw(`
    UPDATE "product" SET search_vector =
      to_tsvector('pg_catalog.english', coalesce(name, '') || ' ' || coalesce(description, ''))
  `);

  // 3. Create GIN index for fast full-text search
  await knex.raw(`
    CREATE INDEX idx_product_search_vector
    ON "product" USING GIN (search_vector)
  `);

  // 4. Auto-update trigger using PostgreSQL built-in C function
  await knex.raw(`
    CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE OF name, description
    ON "product" FOR EACH ROW EXECUTE FUNCTION
    tsvector_update_trigger(search_vector, 'pg_catalog.english', name, description)
  `);

  // 5. Composite indexes for common filter/sort patterns (tenant-scoped)
  await knex.raw(`
    CREATE INDEX idx_product_tenant_price ON "product" (tenant_id, price)
  `);
  await knex.raw(`
    CREATE INDEX idx_product_tenant_rating ON "product" (tenant_id, rating DESC)
  `);
  await knex.raw(`
    CREATE INDEX idx_product_tenant_created ON "product" (tenant_id, created_at DESC)
  `);

  console.log(
    "# Added search_vector column, GIN index, trigger, and composite indexes",
  );
}

export async function down(knex: Knex) {
  await knex.raw(`DROP TRIGGER IF EXISTS tsvectorupdate ON "product"`);
  await knex.raw(`DROP INDEX IF EXISTS idx_product_search_vector`);
  await knex.raw(`DROP INDEX IF EXISTS idx_product_tenant_price`);
  await knex.raw(`DROP INDEX IF EXISTS idx_product_tenant_rating`);
  await knex.raw(`DROP INDEX IF EXISTS idx_product_tenant_created`);
  await knex.raw(`ALTER TABLE "product" DROP COLUMN IF EXISTS search_vector`);

  console.log("# Dropped search_vector column, indexes, and trigger");
}
