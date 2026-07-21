import express from 'express';

const router = express.Router();

router.post('/api/users/signout', (req, res) => {
  (req as any).session = null;
  
  res.send({});
});

export { router as SignoutRouter };
