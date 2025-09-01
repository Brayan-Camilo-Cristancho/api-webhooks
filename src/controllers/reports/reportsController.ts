import type { Request, Response, NextFunction } from "express";
import { asyncHandler, sendSuccessResponse } from "../../utils/index.js";
import { githubService } from "../../services/index.js";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { sendToTeams } from "../../services/comunicationService.js";
import type { ReportRoleUsers, RepositoryData } from "../../core/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getRolesAndUsers = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {

	const branchDefault = "main";

	const repos = await githubService.getInfoRepositories();

	const reposWithProtection = await Promise.all(
		repos.map(async (repo) => {
			const protection = await githubService.getBranchProtection(repo.name, branchDefault) || null;
			return [repo.name, { ...repo, protection }] as [string, RepositoryData];
		})
	);

	const dataRepos = new Map<string, RepositoryData>(reposWithProtection);

	const approversMap = new Map<string, ReportRoleUsers>();

	dataRepos.forEach((repo, key) => {
		if (!repo.protection) return;

		const addToApprovers = (userOrTeam: string) => {
			const existing = approversMap.get(userOrTeam);

			if (existing) {
				(existing.repo as Set<string>).add(key);
			} else {
				approversMap.set(userOrTeam, {
					user_or_team: userOrTeam,
					repo: new Set<string>([key]),
					branch: branchDefault,
					role: "approver",
				});
			}
		};

		repo.protection.allowedUsers.forEach(addToApprovers);
		repo.protection.allowedTeams.forEach(addToApprovers);
	});

	const listUsersMap = new Map<string, ReportRoleUsers>(
		(await githubService.getMembershipUsers()).map((user) => [
			user.user_or_team,
			{ ...user, branch: branchDefault },
		])
	);

	const combinedList = [
		...[...approversMap.values()].map(user => ({
			...user,
			repo: Array.from(user.repo as Set<string>),
		})),
		...[...listUsersMap.entries()]
			.filter(([key]) => !approversMap.has(key))
			.map(([_, user]) => user),
	];

	const folderPath = path.join(__dirname, "...", "exports");

	if (!fs.existsSync(folderPath)) {
		fs.mkdirSync(folderPath, { recursive: true });
	}

	const jsonPath = path.join(folderPath, "roles_usuarios.json");

	fs.writeFileSync(jsonPath, JSON.stringify(combinedList, null, 2), "utf-8");

	sendToTeams(
		{
			event: "membership",
			message: `Roles y usuarios obtenidos correctamente`,
			alert: combinedList.map(user => `${user.user_or_team} - Repos: ${Array.isArray(user.repo) ? user.repo.join(", ") : ""} - Role: ${user.role}`).join("\n"),
		}
	);

	sendSuccessResponse(res, {
		message: `Roles y usuarios obtenidos correctamente.`,
		users: combinedList,
	});
});

