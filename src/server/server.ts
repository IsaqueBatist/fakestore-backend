import express from 'express';
import { router } from './routes';
import './shared/services/yupTranslate'

const server = express();

server.use(express.json());

server.use(router);

export { server };

