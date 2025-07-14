import { knex } from 'knex';
import { development } from './Environment';
import { test } from './Environment';
import dotenv from 'dotenv';


dotenv.config(); // Carrega o .env

const getEnvironment = () => {
  switch (process.env.NODE_ENV) {
    case 'dev':
      return development;
    case 'test':
      return test;
    default:
      throw new Error(`Invalid NODE_ENV: ${process.env.NODE_ENV}`);
  }
};

export const Knex = knex(getEnvironment());
