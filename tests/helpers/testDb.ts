import crypto from "crypto";
import { knex, Knex } from "knex";
import dotenv from "dotenv";
import path from "path";
import { EtableNames } from "../../src/server/database/ETableNames";

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

// App credentials - used for RLS-scoped operations (same as runtime)
const testConfig: Knex.Config = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST,
  },
  pool: { min: 2, max: 10 },
};

// Admin credentials - used for cleanup (TRUNCATE requires ownership/superuser)
const adminConfig: Knex.Config = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_ADMIN_USER,
    password: process.env.DB_ADMIN_PASSWORD,
    database: process.env.DB_NAME_TEST,
  },
  pool: { min: 1, max: 3 },
};

export const testKnex = knex(testConfig);
export const adminKnex = knex(adminConfig);

export const TEST_API_KEY_1 = "test-api-key-tenant-1";
export const TEST_API_KEY_2 = "test-api-key-tenant-2";

export const TEST_API_KEY_1_HASH = crypto
  .createHash("sha256")
  .update(TEST_API_KEY_1)
  .digest("hex");

export const TEST_API_KEY_2_HASH = crypto
  .createHash("sha256")
  .update(TEST_API_KEY_2)
  .digest("hex");

export const TEST_API_SECRET = "test-api-secret-123";

export interface TestTenant {
  id_tenant: number;
  name: string;
  slug: string;
  api_key_hash: string;
  api_secret_hash: string;
  plan: string;
  rate_limit: number;
  is_active: boolean;
}

export async function seedTestTenant(
  overrides: Partial<TestTenant> = {},
): Promise<TestTenant> {
  const bcrypt = await import("bcryptjs");
  const secretHash = await bcrypt.hash(TEST_API_SECRET, 10);

  const tenantData = {
    name: "Test Tenant 1",
    slug: "test-tenant-1",
    api_key_hash: TEST_API_KEY_1_HASH,
    api_secret_hash: secretHash,
    plan: "basic",
    rate_limit: 10,
    is_active: true,
    ...overrides,
  };

  // Use admin to insert into tenants (no RLS on tenants table)
  const [tenant] = await adminKnex(EtableNames.tenants)
    .insert(tenantData)
    .returning("*");

  return tenant as TestTenant;
}

export async function seedSecondTenant(
  overrides: Partial<TestTenant> = {},
): Promise<TestTenant> {
  const bcrypt = await import("bcryptjs");
  const secretHash = await bcrypt.hash("secret-tenant-2", 10);

  const tenantData = {
    name: "Test Tenant 2",
    slug: "test-tenant-2",
    api_key_hash: TEST_API_KEY_2_HASH,
    api_secret_hash: secretHash,
    plan: "sandbox",
    rate_limit: 2,
    is_active: true,
    ...overrides,
  };

  const [tenant] = await adminKnex(EtableNames.tenants)
    .insert(tenantData)
    .returning("*");

  return tenant as TestTenant;
}

export async function createTenantTrx(
  tenantId: number,
): Promise<Knex.Transaction> {
  const trx = await testKnex.transaction();
  await trx.raw(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
  return trx;
}

export async function cleanupTables(): Promise<void> {
  // Use admin connection for TRUNCATE (app user may lack TRUNCATE privilege)
  const tables = [
    EtableNames.idempotency_keys,
    EtableNames.webhook_events,
    EtableNames.cart_items,
    EtableNames.order_items,
    EtableNames.product_comments,
    EtableNames.user_favorites,
    EtableNames.product_categories,
    EtableNames.addresses,
    EtableNames.cart,
    EtableNames.orders,
    EtableNames.products,
    EtableNames.categories,
    EtableNames.user,
    EtableNames.tenants,
  ];

  for (const table of tables) {
    await adminKnex.raw(`TRUNCATE TABLE "${table}" CASCADE`);
  }
}

export async function destroyConnections(): Promise<void> {
  await testKnex.destroy();
  await adminKnex.destroy();
}
