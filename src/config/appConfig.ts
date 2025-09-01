

import type { AppConfig } from '../core/index.js';
import config from './environmentsConfig.js';

const appConfig: AppConfig = {
	app: {
		name: config.app.name,
		port: config.app.server.port,
		apiVersion: config.app.apiVersion,
		GitHubTokenApi: config.github.token_api,
		GitHubTokenValidation: config.github.token_validation,
		GitHubOwner: config.github.owner,
		comunication: config.comunication?.teams || ''
	}
};

export { appConfig };
