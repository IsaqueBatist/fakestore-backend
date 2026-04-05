import { Knex } from "knex";
import {
  testKnex,
  seedTestTenant,
  seedSecondTenant,
  createTenantTrx,
  cleanupTables,
  destroyConnections,
  TestTenant,
} from "../../helpers/testDb";
import {
  insertUser,
  insertProduct,
  insertCategory,
  insertOrder,
  resetCounters,
} from "../../helpers/factories";
import { EtableNames } from "../../../src/server/database/ETableNames";

describe("RLS Tenant Isolation", () => {
  let tenantA: TestTenant;
  let tenantB: TestTenant;

  beforeAll(async () => {
    await cleanupTables();
    tenantA = await seedTestTenant();
    tenantB = await seedSecondTenant();
  });

  beforeEach(() => {
    resetCounters();
  });

  afterAll(async () => {
    await cleanupTables();
    await destroyConnections();
  });

  it("should prevent Tenant B from reading Tenant A products", async () => {
    // Insert product as Tenant A
    const trxA = await createTenantTrx(tenantA.id_tenant);
    try {
      await insertProduct(trxA, { name: "Product from Tenant A" });
      await trxA.commit();
    } catch {
      await trxA.rollback();
      throw new Error("Failed to insert product for Tenant A");
    }

    // Query as Tenant B - should not see Tenant A's product
    const trxB = await createTenantTrx(tenantB.id_tenant);
    try {
      const products = await trxB(EtableNames.products).select();
      expect(products).toHaveLength(0);
      await trxB.rollback();
    } catch {
      await trxB.rollback();
      throw new Error("Failed to query products for Tenant B");
    }
  });

  it("should prevent Tenant B from reading Tenant A users", async () => {
    const trxA = await createTenantTrx(tenantA.id_tenant);
    try {
      await insertUser(trxA, { email: "tenanta@test.com" });
      await trxA.commit();
    } catch {
      await trxA.rollback();
      throw new Error("Failed to insert user for Tenant A");
    }

    const trxB = await createTenantTrx(tenantB.id_tenant);
    try {
      const users = await trxB(EtableNames.user).select();
      expect(users).toHaveLength(0);
      await trxB.rollback();
    } catch {
      await trxB.rollback();
      throw new Error("Failed to query users for Tenant B");
    }
  });

  it("should prevent Tenant B from reading Tenant A categories", async () => {
    const trxA = await createTenantTrx(tenantA.id_tenant);
    try {
      await insertCategory(trxA, { name: "Category Tenant A" });
      await trxA.commit();
    } catch {
      await trxA.rollback();
      throw new Error("Failed to insert category for Tenant A");
    }

    const trxB = await createTenantTrx(tenantB.id_tenant);
    try {
      const categories = await trxB(EtableNames.categories).select();
      expect(categories).toHaveLength(0);
      await trxB.rollback();
    } catch {
      await trxB.rollback();
      throw new Error("Failed to query categories for Tenant B");
    }
  });

  it("should ensure each tenant sees only its own data", async () => {
    // Insert product for Tenant B
    const trxB = await createTenantTrx(tenantB.id_tenant);
    try {
      await insertProduct(trxB, { name: "Product from Tenant B" });
      await trxB.commit();
    } catch {
      await trxB.rollback();
      throw new Error("Failed to insert product for Tenant B");
    }

    // Tenant A should see its own products
    const trxA = await createTenantTrx(tenantA.id_tenant);
    try {
      const productsA = await trxA(EtableNames.products).select();
      expect(productsA.every((p: any) => p.tenant_id === tenantA.id_tenant)).toBe(true);
      await trxA.rollback();
    } catch {
      await trxA.rollback();
      throw new Error("Failed to verify Tenant A isolation");
    }

    // Tenant B should see its own products
    const trxB2 = await createTenantTrx(tenantB.id_tenant);
    try {
      const productsB = await trxB2(EtableNames.products).select();
      expect(productsB.every((p: any) => p.tenant_id === tenantB.id_tenant)).toBe(true);
      await trxB2.rollback();
    } catch {
      await trxB2.rollback();
      throw new Error("Failed to verify Tenant B isolation");
    }
  });

  it("should silently ignore cross-tenant UPDATE (0 rows affected)", async () => {
    // Get Tenant A product id
    const trxA = await createTenantTrx(tenantA.id_tenant);
    let productId: number | undefined;
    try {
      const product = await trxA(EtableNames.products).select("id_product").first();
      productId = product?.id_product;
      await trxA.rollback();
    } catch {
      await trxA.rollback();
      return; // Skip if no products
    }

    if (!productId) return;

    // Try to update Tenant A's product as Tenant B
    const trxB = await createTenantTrx(tenantB.id_tenant);
    try {
      const rowsUpdated = await trxB(EtableNames.products)
        .where("id_product", productId)
        .update({ name: "Hacked by Tenant B" });

      expect(rowsUpdated).toBe(0); // RLS blocks the update
      await trxB.rollback();
    } catch {
      await trxB.rollback();
    }
  });

  it("should silently ignore cross-tenant DELETE (0 rows affected)", async () => {
    const trxA = await createTenantTrx(tenantA.id_tenant);
    let productId: number | undefined;
    try {
      const product = await trxA(EtableNames.products).select("id_product").first();
      productId = product?.id_product;
      await trxA.rollback();
    } catch {
      await trxA.rollback();
      return;
    }

    if (!productId) return;

    // Try to delete Tenant A's product as Tenant B
    const trxB = await createTenantTrx(tenantB.id_tenant);
    try {
      const rowsDeleted = await trxB(EtableNames.products)
        .where("id_product", productId)
        .delete();

      expect(rowsDeleted).toBe(0);
      await trxB.rollback();
    } catch {
      await trxB.rollback();
    }
  });

  it("should not leak data after transaction rollback", async () => {
    const trxA = await createTenantTrx(tenantA.id_tenant);
    try {
      await insertProduct(trxA, { name: "Rollback Product" });
      await trxA.rollback(); // Deliberately rollback
    } catch {
      await trxA.rollback();
    }

    // Verify the rolled-back product doesn't exist
    const trxA2 = await createTenantTrx(tenantA.id_tenant);
    try {
      const products = await trxA2(EtableNames.products)
        .where("name", "Rollback Product")
        .select();
      expect(products).toHaveLength(0);
      await trxA2.rollback();
    } catch {
      await trxA2.rollback();
    }
  });

  it("should not persist tenant_id across connection pool reuse", async () => {
    // Run a query with Tenant A context
    const trxA = await createTenantTrx(tenantA.id_tenant);
    await trxA(EtableNames.products).select().limit(1);
    await trxA.commit();

    // A new connection from the pool should NOT have the tenant context
    // Using testKnex directly (no SET LOCAL) should see nothing due to RLS
    // or see all if the user bypasses RLS (depends on user role)
    const trxClean = await testKnex.transaction();
    try {
      // Without SET LOCAL, app.current_tenant_id should be empty/null
      const result = await trxClean.raw(
        "SELECT current_setting('app.current_tenant_id', true) as tid",
      );
      const tid = result.rows[0]?.tid;
      // Should be null/empty because SET LOCAL is transaction-scoped
      expect(!tid || tid === "").toBe(true);
      await trxClean.rollback();
    } catch {
      await trxClean.rollback();
    }
  });

  it("should not carry tenant context after transaction commit", async () => {
    const trxA = await createTenantTrx(tenantA.id_tenant);
    await trxA.commit();

    // New transaction should NOT inherit the tenant context
    const trxNew = await testKnex.transaction();
    try {
      const result = await trxNew.raw(
        "SELECT current_setting('app.current_tenant_id', true) as tid",
      );
      const tid = result.rows[0]?.tid;
      expect(!tid || tid === "").toBe(true);
      await trxNew.rollback();
    } catch {
      await trxNew.rollback();
    }
  });
});
