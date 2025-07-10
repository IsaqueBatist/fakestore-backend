import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';


const router = Router();

router.get('/', (_, res) => {
  res.send('Ola');
});

router.post('/teste', (req, res) => {
  console.log(req.cookies);
  res.status(StatusCodes.ACCEPTED).json(req.body);
});

export { router };

