import supertest from 'supertest';

import { Knex } from '../src/server/database/knex';
import { server } from '../src/server/server';

//TODO: Refatorar testes

beforeAll(async () => {
  await Knex.migrate.rollback(undefined, true);
  await Knex.migrate.latest();
  await Knex.seed.run(); 
})

afterAll(async () => {
    await Knex.destroy();
})

export const testServer = supertest(server)