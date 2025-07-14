import { knex } from 'knex';
import { development } from './Environment';
import { test } from './Environment';
import dotenv from 'dotenv';
import path from 'path'


dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '..', '.env') });

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
