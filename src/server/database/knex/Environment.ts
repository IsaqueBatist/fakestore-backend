import { Knex } from 'knex';
import path from 'path';
import dotenv from 'dotenv';

// Carrega variáveis do .env da raiz do projeto
dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '..', '.env') });

const migrationsDir = path.resolve(__dirname, '..', 'migrations');
const seedsDir = path.resolve(__dirname, '..', 'seeds');

export const development: Knex.Config = {
  client: 'mssql',
  connection: {
    server: process.env.DB_SERVER as string,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true,
    }
  },
  useNullAsDefault: true,
  migrations: {
    directory: migrationsDir,
  },
  seeds: {
    directory: seedsDir,
  }
};

export const test: Knex.Config = {
  client: 'mssql',
  connection: {
    server: process.env.DB_SERVER as string,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME_TEST as string,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true,
    }
  },
  useNullAsDefault: true,
  migrations: {
    directory: migrationsDir,
  },
  seeds: {
    directory: seedsDir,
  }
};

module.exports = {
  development,
  test
};