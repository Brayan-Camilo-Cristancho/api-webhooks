import type { Request } from "express";

type GitHubEventType = 'push' | 'pull_request' | 'issues' | 'release' | string;

export interface GitHubPushEvent {
	ref: string;
	repository: {
		name: string;
		full_name: string;
		owner: {
			login: string;
			name: string;
		};
	};
	commits: Array<{
		id: string;
		message: string;
		author: {
			name: string;
			email: string;
		};
	}>;
}

export interface GitHubWebhookRequest extends Request {
	body: GitHubPushEvent;
	headers: Request['headers'] & {
		'x-github-event': GitHubEventType;
	};
}