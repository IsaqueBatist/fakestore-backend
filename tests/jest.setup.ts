import supertest from 'supertest';

import { Knex } from '../src/server/database/knex';
import { server } from '../src/server/server';
import { EtableNames } from '../src/server/database/ETableNames';

export const testServer = supertest(server)
//TODO: Refatorar testes

beforeAll(async () => {
  await Knex.migrate.rollback(undefined, true);
  await Knex.migrate.latest();
  await Knex.seed.run(); 

  //Create admin user
  const admin = await testServer.post('/register').send({
    name: 'Admin',
    email: 'admin@exemple.com',
    password_hash: 'adminSenha123'
  })
  await Knex(EtableNames.user).update({role: 'admin'}).where('id_user', admin.body)
})

afterAll(async () => {
    await Knex.destroy();
})
