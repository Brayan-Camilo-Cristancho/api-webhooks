import type { Request, Response, NextFunction } from "express";
import { asyncHandler, sendSuccessResponse } from "../utils/index.js";
import { githubService } from "../services/index.js";
import type { InfoRepositories, InfoUsers } from "../types/index.js";
import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getRolesAndUsers = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {

	const branchDefault = "main";

	const repos = await githubService.getInfoRepositories();

	const reposWithProtection = await Promise.all(
		repos.map(async (repo) => {
			const protection = await githubService.getBranchProtection(repo.name, branchDefault) || null;
			return [repo.name, { ...repo, protection }] as [string, InfoRepositories];
		})
	);

	const dataRepos = new Map<string, InfoRepositories>(reposWithProtection);

	const approversMap = new Map<string, InfoUsers>();

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

	const listUsersMap = new Map<string, InfoUsers>(
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

	const worksheet = XLSX.utils.json_to_sheet(combinedList.map(u => ({
		Usuario: u.user_or_team,
		Rol: u.role,
		Branch: u.branch,
		Repositorios: Array.isArray(u.repo) ? u.repo.join(", ") : "",
	})));

	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Roles_Usuarios");

	const folderPath = path.join(__dirname, "..", "exports");
	const filePath = path.join(folderPath, "roles_usuarios.xlsx");

	if (!fs.existsSync(folderPath)) {
		fs.mkdirSync(folderPath, { recursive: true });
	}

	XLSX.writeFile(workbook, filePath);

	sendSuccessResponse(res, {
		message: `Roles y usuarios obtenidos correctamente. Archivo guardado en: ${filePath}`,
		users: combinedList,
	});
});
