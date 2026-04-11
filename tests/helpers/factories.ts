import { Knex } from "knex";
import { EtableNames } from "../../src/server/database/ETableNames";

let userCounter = 0;
let productCounter = 0;
let categoryCounter = 0;

export function resetCounters(): void {
  userCounter = 0;
  productCounter = 0;
  categoryCounter = 0;
  couponCounter = 0;
}

export function buildUser(overrides: Record<string, unknown> = {}) {
  userCounter++;
  return {
    name: `Test User ${userCounter}`,
    email: `testuser${userCounter}@test.com`,
    password_hash: "$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01", // pre-hashed
    role: "user",
    ...overrides,
  };
}

export function buildProduct(overrides: Record<string, unknown> = {}) {
  productCounter++;
  return {
    name: `Test Product ${productCounter}`,
    description: `Description for product ${productCounter}`,
    price: 29.99,
    stock: 100,
    image_url: `https://example.com/product${productCounter}.jpg`,
    rating: 4.5,
    specifications: { weight: "500g", color: "black" },
    ...overrides,
  };
}

export function buildCategory(overrides: Record<string, unknown> = {}) {
  categoryCounter++;
  return {
    name: `Test Category ${categoryCounter}`,
    description: `Description for category ${categoryCounter}`,
    ...overrides,
  };
}

export function buildAddress(overrides: Record<string, unknown> = {}) {
  return {
    street: "Rua Teste 123",
    city: "Sao Paulo",
    state: "SP",
    zip_code: "01234-567",
    country: "Brasil",
    ...overrides,
  };
}

export async function insertUser(
  trx: Knex.Transaction,
  overrides: Record<string, unknown> = {},
) {
  const userData = buildUser(overrides);
  const [user] = await trx(EtableNames.user).insert(userData).returning("*");
  return user;
}

export async function insertProduct(
  trx: Knex.Transaction,
  overrides: Record<string, unknown> = {},
) {
  const productData = buildProduct(overrides);
  const [product] = await trx(EtableNames.products)
    .insert(productData)
    .returning("*");
  return product;
}

export async function insertCategory(
  trx: Knex.Transaction,
  overrides: Record<string, unknown> = {},
) {
  const categoryData = buildCategory(overrides);
  const [category] = await trx(EtableNames.categories)
    .insert(categoryData)
    .returning("*");
  return category;
}

export async function insertOrder(
  trx: Knex.Transaction,
  userId: number,
  overrides: Record<string, unknown> = {},
) {
  const [order] = await trx(EtableNames.orders)
    .insert({
      user_id: userId,
      total: 0,
      status: "pending",
      ...overrides,
    })
    .returning("*");
  return order;
}

export async function insertCart(trx: Knex.Transaction, userId: number) {
  const [cart] = await trx(EtableNames.cart)
    .insert({ user_id: userId })
    .returning("*");
  return cart;
}

let couponCounter = 0;

export function buildCoupon(overrides: Record<string, unknown> = {}) {
  couponCounter++;
  return {
    code: `TESTCOUPON${couponCounter}`,
    discount_type: "percentage",
    discount_value_cents: 1000, // 10%
    min_order_cents: 0,
    max_uses: null,
    active: true,
    ...overrides,
  };
}

export async function insertCoupon(
  trx: Knex.Transaction,
  overrides: Record<string, unknown> = {},
) {
  const couponData = buildCoupon(overrides);
  const [coupon] = await trx(EtableNames.coupons)
    .insert(couponData)
    .returning("*");
  return coupon;
}

export async function insertAddress(
  trx: Knex.Transaction,
  userId: number,
  overrides: Record<string, unknown> = {},
) {
  const addressData = buildAddress(overrides);
  const [address] = await trx(EtableNames.addresses)
    .insert({ ...addressData, user_id: userId })
    .returning("*");
  return address;
}
