import type { Application, Request, Response } from 'express';
import { appConfig } from '../config/index.js';
import routerWebhooks from './routesWebhooks.js';
import routerApi from './routesApi.js';


export function setRoutes(app: Application) {

	const appName: string = appConfig.app.name;
	const apiVersion: string = appConfig.app.apiVersion;
	const basePath = `/${appName}/${apiVersion}`;

	app.get(`${basePath}/`, (req: Request, res: Response) => {
		res.json({ message: 'API funcionando con TypeScript' });
	});

	app.use(`${basePath}/webhooks/github`, routerWebhooks);
	app.use(`${basePath}/api`, routerApi)

}
	