import { Router } from 'express';

const router = Router();

// Middleware example: Logging requests
router.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Export the middleware
export default router;