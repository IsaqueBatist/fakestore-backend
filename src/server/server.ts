import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'

import { router } from './routes';
import './shared/services'


// Carrega variáveis do .env da raiz do projeto
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const server   = express();

server.use(cors({
  origin:  process.env.ENABLED_CORS
  ? process.env.ENABLED_CORS.split(';')
  : '*'
  //Adicionar endereço do frontend depois
}));

server.use(express.json());

server.use(router);

export { server };

