// src/routes/setRoutes.ts
import type { Application, Request, Response } from 'express';

export function setRoutes(app: Application) {
    app.get('/', (req: Request, res: Response) => {
        res.json({ message: 'API funcionando con TypeScript' });
    });

    app.get('/test-worker', (req: Request, res: Response) => {
        res.json({ message: 'API funcionando con TypeScript' });
    });
}