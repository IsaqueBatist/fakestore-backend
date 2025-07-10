import { Router } from 'express';

const router = Router();

router.get('/', (_, res) => {
  res.send('Ola');
});

router.post('/teste', (req, res) => {
  console.log(req.cookies);
  res.json(req.body);
});

export {router};
