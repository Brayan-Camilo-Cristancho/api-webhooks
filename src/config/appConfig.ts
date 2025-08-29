

import config from './environmentsConfig.js';
import type { AppConfig } from './types/config.js';

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
