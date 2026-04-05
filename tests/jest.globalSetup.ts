import dotenv from "dotenv";
import path from "path";
import { knex } from "knex";

export default async function globalSetup() {
  dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-jwt-secret-key-for-jest-tests";

  // Use admin credentials to run migrations
  const adminKnex = knex({
    client: "pg",
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_ADMIN_USER,
      password: process.env.DB_ADMIN_PASSWORD,
      database: process.env.DB_NAME_TEST,
    },
  });

  try {
    await adminKnex.migrate.latest({
      directory: path.resolve(
        __dirname,
        "..",
        "src",
        "server",
        "database",
        "migrations",
      ),
    });
  } finally {
    await adminKnex.destroy();
  }
}
