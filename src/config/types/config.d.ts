export interface AppConfig {
	app: {
		name: string;
		port: number;
		apiVersion: string;
		GitHubTokenApi: string;
		GitHubTokenValidation: string;
		GitHubOwner: string;
	};
}
