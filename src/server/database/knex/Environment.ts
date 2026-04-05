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

export const development: Knex.Config = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
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
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
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
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
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

module.exports = {
  development,
  test,
  production,
};
