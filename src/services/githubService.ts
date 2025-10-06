
import { octokit } from "../auth/index.js";
import { appConfig } from "../config/index.js";
import type { BranchProtection, ReportRoleUsers, RepositoryData, RepositoryEventPayload, Role } from "../core/index.js";
import { safeAsync } from "../utils/index.js";


const getInfoRepositories = safeAsync(async (): Promise<RepositoryData[]> => {

	const data = await octokit.paginate(
		octokit.rest.repos.listForOrg,
		{ org: appConfig.app.GitHubOwner, per_page: 100 }
	);

	return data.map(({ name, full_name, private: isPrivate, html_url, updated_at, forks_count, created_at }) => ({
		name,
		full_name,
		private: isPrivate,
		url: html_url,
		updated_at: updated_at ?? "",
		forks_count: forks_count ?? 0,
		created_at: created_at ?? ""
	}));

});

const getBranchProtection = async (repo: string, branch: string): Promise<BranchProtection | null> => {
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

const getMembershipUsers = safeAsync(async (): Promise<ReportRoleUsers[]> => {

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

const getDataUser = safeAsync(async (username: string) => {

	console.log(`Obteniendo datos del usuario: ${username}`);

	const { data: user } = await octokit.rest.users.getByUsername({
		username: username,
	});

	return user;

});

const createPullRequest = safeAsync(async (data: RepositoryEventPayload) => {

	const headBranch = data.ref ? data.ref.replace("refs/heads/", "") : "";

	const existingPRs = await octokit.rest.pulls.list({
		owner: appConfig.app.GitHubOwner,
		repo: data.repository.name,
		state: "open",
		head: `${appConfig.app.GitHubOwner}:${headBranch}`,
		base: "main"
	});

	if (existingPRs.data.length > 0 && existingPRs.data[0]) {

		return existingPRs.data[0];
	}

	const res = await octokit.rest.pulls.create({
		owner: appConfig.app.GitHubOwner,
		repo: data.repository.name,
		title: ":robot: Pull request generated automatically",
		head: headBranch,
		base: "main",
		body: `Pull request generado automáticamente desde la rama ${headBranch} por el webhook de GitHub. Para el commit ${data.commits[0]?.id}, con la siguiente especificación: ${data.commits[0]?.message}`,
	});

	return res.data;
});


const commitExists = safeAsync(async (repo: string, commitSha: string) => {
	try {
		await octokit.rest.repos.getCommit({
			owner: appConfig.app.GitHubOwner,
			repo,
			ref: commitSha
		});
		return true;
	} catch (error: any) {
		if (error.status === 404) {
			return false;
		}
		throw error;
	}
});

export const githubService = { getInfoRepositories, getBranchProtection, listBranches, getMembershipUsers, getDataUser, createPullRequest, commitExists };

