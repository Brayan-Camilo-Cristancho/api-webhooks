import config from 'config';
import type { AppConfig } from './types/config.js';

const appConfig: AppConfig = {
	app: {
		name: config.get<string>('app.name'),
		port: config.get<number>('app.server.port'),
		apiVersion: config.get<string>('app.api_version'),
		GitHubTokenApi: config.get<string>('github.token_api'),
		GitHubTokenValidation: config.get<string>('github.token_validation'),
		GitHubOwner: config.get<string>('github.owner')
	}
};

export { appConfig };
