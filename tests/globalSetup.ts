import crypto from "crypto";
import { Knex } from "../src/server/database/knex";
import { EtableNames } from "../src/server/database/ETableNames";
import { passwordCrypto } from "../src/server/shared/services/PasswordCrypto";

// Known test API key -- used by jest.setup.ts to inject x-api-key header
export const TEST_API_KEY = "test_key_for_integration_tests_0000000000000000";
export const TEST_API_KEY_HASH = crypto
  .createHash("sha256")
  .update(TEST_API_KEY)
  .digest("hex");

export default async function globalSetup() {
  // Drop all FK constraints before rollback to avoid ordering issues
  const fkResult = await Knex.raw(`
    SELECT
      tc.constraint_name,
      tc.table_schema,
      tc.table_name
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
  `);

  for (const row of fkResult.rows) {
    await Knex.raw(
      `ALTER TABLE "${row.table_schema}"."${row.table_name}" DROP CONSTRAINT "${row.constraint_name}"`
    );
  }

  await Knex.migrate.forceFreeMigrationsLock();
  await Knex.migrate.rollback(undefined, true);
  await Knex.migrate.latest();

  // Create test tenant BEFORE seeding (RLS requires tenant context)
  const [testTenant] = await Knex(EtableNames.tenants)
    .insert({
      name: "Test Tenant",
      slug: "test-tenant",
      api_key_hash: TEST_API_KEY_HASH,
      api_secret_hash: "test_secret_placeholder",
      plan: "basic",
      rate_limit: 100,
      is_active: true,
    })
    .returning("id_tenant");

  const tenantId = testTenant.id_tenant;

  // Set RLS context so seeds and subsequent inserts are scoped to test tenant
  await Knex.raw(`SET app.current_tenant_id = '${tenantId}'`);

  await Knex.seed.run();

  // Create admin user directly in DB
  const hashedPassword = await passwordCrypto.hashPassword("adminSenha123");
  await Knex(EtableNames.user).insert({
    name: "Admin",
    email: "admin@exemple.com",
    password_hash: hashedPassword,
    role: "admin",
  });

  // Create cart for admin
  const [admin] = await Knex(EtableNames.user)
    .select("id_user")
    .where("email", "admin@exemple.com");
  await Knex(EtableNames.cart).insert({ user_id: admin.id_user });

  await Knex.destroy();
}
