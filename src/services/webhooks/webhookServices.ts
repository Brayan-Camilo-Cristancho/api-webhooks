import type { AlertResponse, BranchProtectionRuleEventPayload, DeleteEventPayload, RepositoryEventPayload } from '../../core/index.js';
import { githubService } from '../githubService.js';

export class SecurityWebhookService {

	private readonly IMPORTANT_BRANCHES = ["main", "develop", "quality"];

	validateDeletedBranch(payload: DeleteEventPayload): AlertResponse | null {

		if (payload.ref_type !== "branch") {
			return null;
		}

		const branch = payload.ref;

		const repository = payload.repository?.full_name;

		if (!this.IMPORTANT_BRANCHES.includes(branch)) {
			return null;
		}

		return {
			event: "delete",
			message: "Rama importante eliminada",
			repository,
			branch,
			alert: `Alerta: Se eliminó la rama protegida ${branch} en el repositorio ${repository}, enlace: ${payload.repository?.html_url}`,
			category: "high",
			actor: payload.sender?.login
		};
	}

	// TODO: Revisar la validación por owner>
	validateBranchProtectionRemoval(payload: BranchProtectionRuleEventPayload): AlertResponse | null {

		const action = payload.action;

		const branchName = payload.rule?.name;

		const repositoryFullName = payload.repository?.full_name;

		if (action !== "deleted") {
			return null;
		}

		if (!branchName || !this.IMPORTANT_BRANCHES.includes(branchName)) {
			return null;
		}

		return {
			event: "branch_protection_rule",
			message: "Protección de rama eliminada",
			repository: repositoryFullName,
			branch: branchName,
			alert: `Se eliminó la protección de la rama \"${branchName}\" en el repositorio ${repositoryFullName}, enlace: ${payload.repository?.html_url}`,
			category: "medium"
		};
	}

}

export class TeamWebhookService {

}

export class RepositoryWebhookService {

	monitorPrivateRepositoryRemoved(payload: RepositoryEventPayload): AlertResponse | null {

		const action = payload.action;

		const repo = payload.repository;

		const org = payload.organization?.login;

		const creator = payload.sender?.login;

		if (action !== "deleted") {
			return null;
		}

		const repoName = repo.full_name;

		const repoUrl = repo.html_url;

		const isPublic = !repo.private;

		if (isPublic) {
			return null;
		}

		return {
			event: "repository",
			message: "Repositorio eliminado",
			repository: repoName,
			alert: `Se eliminó un repositorio (${repoName}) en la organización ${org} por ${creator}. URL previa a la eliminación: ${repoUrl}`,
			category: "high",
			actor: creator || "N/A"
		};
	}

	async monitorPushUser(payload: RepositoryEventPayload): Promise<AlertResponse | null> {

		const githubUser = payload.pusher?.name ?? "";

		const githubEmail = payload.pusher?.email ?? "";

		const headCommit = payload.head_commit;

		const gitData = headCommit?.author;

		const inconsistencies: string[] = [];

		if (gitData) {

			if (gitData.username && gitData.username.toLowerCase() === githubUser.toLowerCase()) {
				gitData.name = gitData.username;
			}

			if (gitData.name?.toLowerCase() !== githubUser.toLowerCase()) {

				inconsistencies.push(
					`El autor del commit (username: ${gitData.name}, email: ${gitData.email}) no coincide con el usuario de GitHub (username: ${githubUser}, email: ${githubEmail}).`
				);
			}

			if (gitData.email !== githubEmail) {
				inconsistencies.push(
					`El email del autor del commit (${gitData.email}), no coincide con el email de GitHub ($ ${githubEmail}).`
				);
			}

		}

		if (inconsistencies.length > 0) {
			return {
				event: "repository",
				message: "Inconsistencia en datos de usuario",
				repository: payload.repository?.full_name ?? "",
				alert: inconsistencies.join(" | "),
				category: "low",
				actor: githubUser
			};
		}

		return null;
	}

	async generatePullRequest(payload: RepositoryEventPayload): Promise<AlertResponse | null> {

		const branch = /release|develop/gi;

		if (!branch.test(payload.ref || '')) {
			console.log(`Evento recibido en rama no soportada: ${payload.ref}`);
			return null;
		}

		const pr = await githubService.createPullRequest(payload);

		return {
			event: "repository",
			message: "Pull request generado",
			alert: `Webhook recibido y procesado correctamente se creo el pull request ${pr.html_url}`,
			repository: payload.repository?.full_name,
			category: 'success'

		};
	}

	changesFolderConfig(payload: RepositoryEventPayload): AlertResponse | null {

		const commits = payload.commits;

		const repo = payload.repository;

		let alertMessages: any[] = [];

		commits.forEach((commit: any) => {

			const protectedFiles = commit.modified.filter((f: string) => f.startsWith("config/Jenkinsfile"));

			if (protectedFiles.length > 0) {
				const message =
				{
					message: `Carpeta protegida modificada en el repositorio ${repo.full_name} por el usuario ${commit.author.username}.}`,
					file: `${protectedFiles.join(", ")}`,
					commit: `${commit.url}`,
					commitMessage: `"${commit.message}"`
				}

				alertMessages.push(message);
			}

		});

		if (alertMessages.length === 0) {
			return null;
		}

		const fullRef = payload.ref ?? "";

		const branch = fullRef.replace("refs/heads/", "");

		return {
			event: 'repository',
			message: "Alerta sobre carpeta protegida modificada ",
			branch: `${branch}`,
			repository: repo.full_name,
			alert: alertMessages.map(am => ` Alerta: ${am.message}, Archivo: ${am.file}, Commit: ${am.commit}, Mensaje del commit: ${am.commitMessage}`).join(" | "),
			category: 'medium',
			actor: payload.pusher?.name || "N/A"
		};
	}

}

export class TokenWebhookService {


}
