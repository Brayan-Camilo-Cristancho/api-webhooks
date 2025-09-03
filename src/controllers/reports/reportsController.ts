import type { Request, Response, NextFunction } from "express";
import { asyncHandler, sendSuccessResponse } from "../../utils/index.js";
import { githubService } from "../../services/index.js";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import type { AlertResponse, ReportRoleUsers, RepositoryData } from "../../core/index.js";
import { sendToTeams } from "../../services/comunicationService.js";

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


	sendSuccessResponse(res, {
		message: `Roles y usuarios obtenidos correctamente.`,
		users: combinedList,
	});
});


async function testSend(data: AlertResponse, label: string) {
  console.log(`\n=== [TEST: ${label}] ===`);
  try {
    await sendToTeams(data);
    console.log("✅ Mensaje enviado con éxito");
  } catch (err) {
    console.error("❌ Error en la prueba:", err);
  }
}

export async function testDeleteEvent() {
  const data: AlertResponse = {
    event: "delete",
    message: "Se eliminó la rama feature/bugfix",
    repository: "inteligentSolutionsOrg/webhook-service",
    branch: "feature/bugfix",
    alert: "Una rama fue eliminada sin autorización",
    category: "high"
  };
  await testSend(data, "Delete Event");
}

export async function testBranchProtection() {
  const data: AlertResponse = {
    event: "branch_protection_rule",
    message: "Se modificó la regla de protección en main",
    repository: "inteligentSolutionsOrg/webhook-service",
    branch: "main",
    alert: "Se cambiaron las políticas de protección de rama",
    category: "high"
  };
  await testSend(data, "Branch Protection Event");
}
