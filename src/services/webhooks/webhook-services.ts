import type {
	DeleteEventPayload,
	BranchProtectionRuleEventPayload,
	BypassPushRulesetEventPayload,
	MembershipEventPayload,
	RepositoryEventPayload,
	PersonalAccessTokenRequestEventPayload,
	AlertResponse
} from '../../types/index.js';
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
			message: "Webhook recibido y procesado correctamente, se crea alerta de rama importante eliminada",
			repository,
			branch,
			alert: `Alerta: Se eliminó la rama protegida ${branch} en el repo ${repository}`
		};
	}

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
			alert: `Se eliminó la protección de la rama "${branchName}" en el repositorio ${repositoryFullName}.`,
		};
	}

	monitorBypassPushRuleset(payload: BypassPushRulesetEventPayload): AlertResponse {

		const action = payload.action;

		const actor = payload.bypass_request?.actor?.login;

		const branch = payload.bypass_request?.target?.ref?.replace("refs/heads/", "");

		const repository = payload.repository?.full_name;

		const state = payload.bypass_request?.state;

		return {
			event: "bypass_request_push_ruleset",
			message: "Solicitud de bypass detectada",
			repository,
			branch,
			alert: `Solicitud de bypass (${action}) en la rama "${branch}" del repositorio ${repository} por el usuario ${actor}. Estado: ${state}`,
		};
	}
}

export class TeamWebhookService {

	monitorMembershipChanges(payload: MembershipEventPayload): AlertResponse | null {

		const action = payload.action;

		const member = payload.member?.login;

		const team = payload.team?.name;

		const organization = payload.organization?.login;

		const sender = payload.sender?.login;

		if (action !== "added" && action !== "removed") {
			return null;
		}

		const alertMessage =
			action === "added"
				? `El usuario ${member} fue agregado al equipo ${team} en la organización ${organization} por ${sender}.`
				: `El usuario ${member} fue eliminado del equipo ${team} en la organización ${organization} por ${sender}.`;

		return {
			event: "membership",
			message: `Cambio en membresía detectado: ${action}`,
			alert: alertMessage,
		};
	}
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

		if (!isPublic) {
			return null;
		}

		return {
			event: "repository",
			message: "Repositorio eliminado",
			repository: repoName,
			alert: `Se eliminó un repositorio (${repoName}) en la organización ${org} por ${creator}. URL: ${repoUrl}`,
		};
	}

	async monitorPushUser(payload: RepositoryEventPayload): Promise<AlertResponse | null> {

		const gitUser = payload.pusher?.name ?? "";
		const gitEmail = payload.pusher?.email ?? "";
		const githubUser = payload.sender?.login ?? "";
		const githubEmail = await githubService.getDataUser(githubUser).then(user => user.email).catch(() => "");
		const message = [];


		if (gitEmail && githubEmail && gitEmail !== githubEmail) {
			message.push(`Inconsistencia detectada: El correo del usuario que hizo push (${gitUser}, ${gitEmail}) no tiene coincidencia cone el correo de GitHub (${githubUser}, ${githubEmail}).`);
		}

		if (gitUser && githubUser && gitUser !== githubUser) {
			message.push(`Inconsistencia detectada: El usuario que hizo push (${gitUser}, ${gitEmail}) no coincide con el usuario de GitHub (${githubUser}, ${githubEmail}).`);
		}

		if (message.length > 0) {
			return {
				event: "repository",
				message: "Inconsistencia en datos de usuario",
				repository: payload.repository?.full_name ?? "",
				alert: message.join(" , "),
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
			alert: `Webhook recibido y procesado correctamente se creo el pull request ${pr.data.html_url}`,
			repository: payload.repository?.full_name
		};
	}

	changesFolderConfig(payload: RepositoryEventPayload): AlertResponse | null {

		const commits = payload.commits;

		const repo = payload.repository;

		let alertMessages: string[] = [];

		commits.forEach((commit: any) => {

			const protectedFiles = commit.modified.filter((f: string) => f.startsWith("config/Jenkinsfile"));

			if (protectedFiles.length > 0) {
				const message =
					`Carpeta protegida modificada en el repositorio ${repo.full_name} por el usuario ${commit.author.username}
 					 Archivos: ${protectedFiles.join(", ")}
					 Commit: ${commit.url}
					 Mensaje: "${commit.message}"`;

				alertMessages.push(message);
			}

		});

		if (alertMessages.length === 0) {
			return null;
		}

		return {
			event: 'repository',
			message: "Webhook recibido y procesado correctamente, se crea alerta de carpeta protegida",
			repository: repo.full_name,
			alert: JSON.stringify(alertMessages),
		};
	}

	async forcePush(payload: RepositoryEventPayload): Promise<AlertResponse | null> {


		const repo = payload.repository.name;

		const branch = /main/gi;

		const before = payload.before || '';

		const after = payload.after || '';

		const commits = payload.commits || [];

		if (!branch.test(payload.ref || '')) {
			console.log(`Evento recibido en rama no soportada: ${payload.ref}`);
			return null;
		}

		let status = "No clasificado";

		if (before.startsWith("000000")) {
			return null;
		} else if (after.startsWith("000000")) {
			return null;
		} else if (commits.length > 0) {
			return null;
		} else {

			const repo = payload.repository.name;

			const exists = await githubService.commitExists(repo, before);

			if (!exists) {
				status = `Force push detectado en el repositorio ${repo} y en la rama ${payload.ref}`;
			} else {
				status = `Posible rebase/reset en el repositorio ${repo} y en la rama ${payload.ref}`;
			}
		}

		return {
			event: 'repository',
			message: "Webhook recibido y procesado correctamente, se crea alerta de posible force push",
			repository: repo,
			alert: status
		};
	}

}

export class TokenWebhookService {

	monitorPersonalAccessTokenRequests(payload: PersonalAccessTokenRequestEventPayload): AlertResponse {

		const action = payload.action;

		const requestInfo = payload.personal_access_token_request;

		const org = payload.organization?.login || "organización desconocida";

		const user = requestInfo?.owner?.login || "desconocido";

		const scopes = requestInfo?.scopes?.join(", ") || "sin scopes";

		const state = requestInfo?.state || "unknown";

		let alertMessage = "";

		if (action === "created") {
			alertMessage = `El usuario ${user} solicitó un token de acceso personal (PAT) para la organización ${org} con scopes: ${scopes}. Estado: ${state}`;
		} else if (action === "approved") {
			alertMessage = `La solicitud de PAT para ${user} en ${org} fue APROBADA. Scopes: ${scopes}`;
		} else if (action === "denied") {
			alertMessage = `La solicitud de PAT para ${user} en ${org} fue RECHAZADA.`;
		}

		return {
			event: "personal_access_token_request",
			message: `Evento PAT detectado: ${action}`,
			alert: alertMessage,
		};
	}
}
