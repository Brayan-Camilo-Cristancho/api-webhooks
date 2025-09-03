import { Router } from 'express';
import { getRolesAndUsers } from '../controllers/index.js';

const router = Router();

router.get("/roles", getRolesAndUsers);

export default router;

