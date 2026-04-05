import dotenv from "dotenv";
import { Knex } from "knex";
import path from "path";

// Carrega variáveis do .env da raiz do projeto
dotenv.config({
  path: path.resolve(__dirname, "..", "..", "..", "..", ".env"),
});

const migrationsDir = path.resolve(__dirname, "..", "migrations");
const seedsDir = path.resolve(__dirname, "..", "seeds");

const pool = {
  min: 2,
  max: 10,
};

const baseConnection = {
  host: process.env.DB_HOST as string,
  port: Number(process.env.DB_PORT) || 5432,
};

// Credenciais admin — usadas pelo knex CLI (migrations, seeds)
const adminCredentials = {
  user: process.env.DB_ADMIN_USER as string,
  password: process.env.DB_ADMIN_PASSWORD as string,
};

// Credenciais app — usadas pela aplicação em runtime
const appCredentials = {
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
};

// --- Configs de RUNTIME (usadas pela app e worker) ---

export const development: Knex.Config = {
  client: "pg",
  connection: {
    ...baseConnection,
    ...appCredentials,
    database: process.env.DB_NAME as string,
  },
  pool,
  migrations: {
    directory: migrationsDir,
  },
  seeds: {
    directory: seedsDir,
  },
};

export const test: Knex.Config = {
  client: "pg",
  connection: {
    ...baseConnection,
    ...appCredentials,
    database: process.env.DB_NAME_TEST as string,
  },
  pool,
  migrations: {
    directory: migrationsDir,
  },
  seeds: {
    directory: seedsDir,
  },
};

export const production: Knex.Config = {
  client: "pg",
  connection: {
    ...baseConnection,
    ...appCredentials,
    database: process.env.DB_NAME_PRODUCTION as string,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  },
  pool,
  migrations: {
    directory: migrationsDir,
  },
  seeds: {
    directory: seedsDir,
  },
};

// --- Configs de ADMIN (usadas pelo knex CLI: migrate, seed, rollback) ---

const migrationDevelopment: Knex.Config = {
  ...development,
  connection: {
    ...baseConnection,
    ...adminCredentials,
    database: process.env.DB_NAME as string,
  },
};

const migrationTest: Knex.Config = {
  ...test,
  connection: {
    ...baseConnection,
    ...adminCredentials,
    database: process.env.DB_NAME_TEST as string,
  },
};

const migrationProduction: Knex.Config = {
  ...production,
  connection: {
    ...baseConnection,
    ...adminCredentials,
    database: process.env.DB_NAME_PRODUCTION as string,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  },
};

// module.exports é o que o knex CLI lê — usa credenciais admin
module.exports = {
  development: migrationDevelopment,
  test: migrationTest,
  production: migrationProduction,
};
