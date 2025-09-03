import { Router } from 'express';
import { getRolesAndUsers, testBranchProtection, testDeleteEvent } from '../controllers/index.js';

const router = Router();

router.get("/roles", getRolesAndUsers);
router.get("/test/send", () => {
	testBranchProtection();
});

export default router;

