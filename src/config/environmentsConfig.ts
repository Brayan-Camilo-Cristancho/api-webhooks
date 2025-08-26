import dotenv from 'dotenv';

dotenv.config();

type Env = 'development' | 'production';

const deepMerge = (target: any, source: any): any => {

	const result = { ...target };

	for (const key in source) {

		const sourceValue = source[key];
		const targetValue = target[key];

		if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
			result[key] = deepMerge(targetValue || {}, sourceValue);
		} else {
			result[key] = sourceValue;
		}
	}

	return result;
}

const baseConfig = {
	app: {
		name: 'dev-ops-webhooks',
		apiVersion: 'v1',
		server: {
			port: 8080,
		},
	},
};

const environments = {
	development: {
		app: {
			name: 'dev-ops-webhooks-dev',
			server: {
				port: 3000,
			},
		},
		github: {
			token_api: process.env.GITHUB_SECRET_API_DEV || '',
			token_validation: process.env.GITHUB_SECRET_VALIDATION_DEV || '',
			owner: process.env.GITHUB_OWNER_DEV || '',
		},
	},
	production: {
		github: {
			token_api: process.env.GITHUB_SECRET_API || '',
			token_validation: process.env.GITHUB_SECRET_VALIDATION || '',
			owner: process.env.GITHUB_OWNER || '',
		},
	},
};

const currentEnv: Env = (process.env.NODE_ENV as Env) || 'development';

const envConfig = environments[currentEnv] ?? {};

const config = deepMerge(baseConfig, envConfig);

export default config;