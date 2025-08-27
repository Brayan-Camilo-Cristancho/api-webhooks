
import { octokit } from "../auth/index.js";
import { appConfig } from "../config/index.js";
import type { GitHubRepo, InfoBranchProtection, InfoRepositories, InfoUsers, Role } from "../types/index.js";
import { safeAsync } from "../utils/index.js";


const getInfoRepositories = safeAsync(async (): Promise<InfoRepositories[]> => {

	const repositories: GitHubRepo[] = [];

	let page = 1;

	const perPage = 100;

	while (true) {

		const { data } = await octokit.rest.repos.listForOrg({
			org: appConfig.app.GitHubOwner,
			per_page: perPage,
			page
		});

		repositories.push(...data);

		if (data.length < perPage) break;

		page++;

	}

	return repositories.map(({ name, full_name, private: isPrivate, html_url, updated_at, forks_count, created_at }) => ({
		name,
		full_name,
		private: isPrivate,
		url: html_url,
		updated_at: updated_at ?? "",
		forks_count: forks_count ?? 0,
		created_at: created_at ?? ""
	}));

});



const getBranchProtection = async (repo: string, branch: string): Promise<InfoBranchProtection | null> => {
	try {

		const res = await octokit.rest.repos.getBranchProtection({
			owner: appConfig.app.GitHubOwner,
			repo,
			branch
		});

		const protectionInfo = {
			requiredApprovals: res.data.required_pull_request_reviews?.required_approving_review_count || 0,
			requireCodeOwnerReviews: res.data.required_pull_request_reviews?.require_code_owner_reviews || false,
			allowedUsers: res.data.restrictions?.users?.map(u => u.login || '') || [],
			allowedTeams: res.data.restrictions?.teams?.map(t => t.name || '') || [],
			enforceAdmins: res.data.enforce_admins?.enabled || false
		};

		return protectionInfo;

	} catch (error: any) {
		if (error.status === 404) {
			return null;
		}
		throw error;
	}
};

const getMembershipUsers = safeAsync(async (): Promise<InfoUsers[]> => {

	const users = await octokit.paginate(
		octokit.rest.orgs.listMembers,
		{ org: appConfig.app.GitHubOwner, per_page: 100 },
		(response) => response.data.map(u => u.login)
	);

	const res = await Promise.all(
		users.map(async (login) => {
			const membership = await octokit.rest.orgs.getMembershipForUser({
				org: appConfig.app.GitHubOwner,
				username: login,
			});

			return {
				user_or_team: login,
				role: membership.data.role as Role,
				repo: new Set<string>(),
				branch: '',
			};
		})
	);

	return res;
});

const listBranches = safeAsync(async (owner: string, repo: string) => {
	const res = await octokit.rest.repos.listBranches({ owner, repo });
	return res.data.map(branch => ({ name: branch.name, protected: branch.protected }));
});

export const githubService = { getInfoRepositories, getBranchProtection, listBranches, getMembershipUsers };

