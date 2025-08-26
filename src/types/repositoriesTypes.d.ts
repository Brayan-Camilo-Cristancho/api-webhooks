import type { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

export interface InfoBranchProtection {
	requiredApprovals: number;
	requireCodeOwnerReviews: boolean;
	allowedUsers: string[];
	allowedTeams: string[];
	enforceAdmins: boolean;
}

export interface InfoRepositories {
	name: string,
	full_name: string,
	private: boolean,
	url: string,
	updated_at: string,
	forks_count: number,
	created_at: string,
	protection?: InfoBranchProtection | null
}

export type DataRepositories = {
	name_repository: string;
	branches: Set<string>;
}

export type GitHubRepo = RestEndpointMethodTypes["repos"]["listForOrg"]["response"]["data"][number];

