import dotenv from 'dotenv';
import { knex } from 'knex';
import path from 'path';
import { development, production, test } from './Environment';


dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '..', '.env') });

const getEnvironment = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return production;
    case 'test':
      return test;
    case 'development':
      return development
    default:
      throw new Error(`Invalid NODE_ENV: ${process.env.NODE_ENV}`);
  }
};

export const Knex = knex(getEnvironment());
