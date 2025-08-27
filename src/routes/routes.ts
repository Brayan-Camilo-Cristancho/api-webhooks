import type { Application, Request, Response } from 'express';
import { json } from 'express';
import { verifySignature } from '../middlewares/index.js';
import { generatePullRequest, getRolesAndUsers, validateChangesFolderConfig } from '../controllers/index.js';
import { appConfig } from '../config/index.js';


export function setRoutes(app: Application) {
    const appName: string = appConfig.app.name;
    const apiVersion: string = appConfig.app.apiVersion;

    const basePath = `/${appName}/${apiVersion}`;

    app.get(`${basePath}/`, (req: Request, res: Response) => {
        res.json({ message: 'API funcionando con TypeScript' });
    });

    app.get(`${basePath}/test-worker`, (req: Request, res: Response) => {
        res.json({ message: 'API funcionando con TypeScript' });
    });

    app.post(
        `${basePath}/webhooks/github`,
        json({ verify: verifySignature }),
        generatePullRequest
    );

    app.post(
        `${basePath}/webhooks/github/validate`,
        json({ verify: verifySignature }),
        validateChangesFolderConfig
    );

    app.get(`${basePath}/roles`, getRolesAndUsers);

}
