import type {
	DeleteEventPayload,
	BranchProtectionRuleEventPayload,
	BypassPushRulesetEventPayload,
	MembershipEventPayload,
	RepositoryEventPayload,
	PersonalAccessTokenRequestEventPayload,
	AlertResponse
} from '../../types/github-webhooks.js';

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
