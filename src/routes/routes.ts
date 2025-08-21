import type { Application, Request, Response } from 'express';
import { json } from 'express';
import { verifySignature } from '../middlewares/index.js';
import { generatePullRequest } from '../controllers/index.js';

export function setRoutes(app: Application) {
    app.get('/', (req: Request, res: Response) => {
        res.json({ message: 'API funcionando con TypeScript' });
    });

    app.get('/test-worker', (req: Request, res: Response) => {
        res.json({ message: 'API funcionando con TypeScript' });
    });

   app.post(
        "/webhooks/github",
        json({ verify: verifySignature }),
        generatePullRequest
    );
}2