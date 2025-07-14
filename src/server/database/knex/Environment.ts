import { Knex } from 'knex';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config(); // Carrega o .env

const baseConfig: Partial<Knex.Config> = {
  client: 'mssql',
  useNullAsDefault: true,
  migrations: {
    directory: path.resolve(__dirname, '..', 'migrations')
  },
  seeds: {
    directory: path.resolve(__dirname, '..', 'seeds')
  }
};

export const development: Knex.Config = {
  ...baseConfig,
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
  }
};

export const test: Knex.Config = {
  ...baseConfig,
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
  }
};
