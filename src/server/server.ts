import express from 'express';
import { router } from './routes';
import knex from 'knex'
import {development} from './database/knex/Environment'
import './shared/services/yupTranslate'

const server = express();

server.use(express.json());

server.use(router);

const db = knex(development)

db.raw('SELECT 1 AS result')
  .then(res => console.log('Conexão bem-sucedida:', res))
  .catch(err => console.error('Erro de conexão:', err))

export { server };

