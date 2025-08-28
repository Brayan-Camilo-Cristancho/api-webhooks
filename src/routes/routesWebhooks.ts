import { Router } from 'express';
import { json } from 'express';
import { verifySignature } from '../middlewares/index.js';
import { ChangesGeneratePullRequest } from '../controllers/index.js';

const router = Router();

router.post('/webhooks/github', json({ verify: verifySignature }), ChangesGeneratePullRequest);

export default router;

