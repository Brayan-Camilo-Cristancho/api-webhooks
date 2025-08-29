import type { NextFunction, Request, Response } from "express";
import { BadRequestError, sendSuccessResponse, asyncHandler } from "../../utils/index.js";
import { WebhookServiceFactory } from "../../services/index.js";
import type {
	ReportGitHubEventType,
	DeleteEventPayload,
	BranchProtectionRuleEventPayload,
	BypassPushRulesetEventPayload,
	MembershipEventPayload,
	RepositoryEventPayload,
	PersonalAccessTokenRequestEventPayload
} from "../../types/index.js";


const reportDeleteImportantBranch = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

	const event = req.headers["x-github-event"] as ReportGitHubEventType;

	console.log(`Evento recibido para validar ramas importantes borradas: ${event}`);

	if (event !== "delete") {
		throw new BadRequestError("Evento no soportado. Solo se procesan eventos delete.", "UNSUPPORTED_EVENT");
	}

	const payload = req.body as DeleteEventPayload;

	if (payload.ref_type !== "branch") {
		throw new BadRequestError("Solo se procesan eliminaciones de ramas.", "INVALID_REF_TYPE");
	}

	const securityService = WebhookServiceFactory.getServiceForEventType(event);

	const result = securityService.validateDeletedBranch(payload);

	if (result) {
		sendSuccessResponse(res, result);
	}

});

const reportDeleteProtectionBranch = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

	const event = req.headers["x-github-event"] as ReportGitHubEventType;

	console.log(`Evento recibido para validar eliminación de protección en ramas: ${event}`);

	if (event !== "branch_protection_rule") {
		throw new BadRequestError("Evento no soportado. Solo se procesan branch_protection_rule.", "UNSUPPORTED_EVENT");
	}

	const payload = req.body as BranchProtectionRuleEventPayload;

	const securityService = WebhookServiceFactory.getServiceForEventType(event);

	const result = securityService.validateBranchProtectionRemoval(payload);

	if (result) {
		sendSuccessResponse(res, result);
	}

});

const reportBypassPushRuleset = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

	const event = req.headers["x-github-event"] as ReportGitHubEventType;

	console.log(`Evento recibido para validar incumplimiento de reglas de push: ${event}`);

	if (event !== "bypass_request_push_ruleset") {
		throw new BadRequestError("Evento no soportado. Solo se procesan bypass_request_push_ruleset.", "UNSUPPORTED_EVENT");
	}

	const payload = req.body as BypassPushRulesetEventPayload;

	const securityService = WebhookServiceFactory.getServiceForEventType(event);

	const result = securityService.monitorBypassPushRuleset(payload);

	sendSuccessResponse(res, result);
});

const reportMembershipChange = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

	const event = req.headers["x-github-event"] as ReportGitHubEventType;

	console.log(`Evento recibido para validar cambios en membresía de equipos: ${event}`);

	if (event !== "membership") {
		throw new BadRequestError("Evento no soportado. Solo se procesan eventos membership.", "UNSUPPORTED_EVENT");
	}

	const payload = req.body as MembershipEventPayload;

	const teamService = WebhookServiceFactory.getServiceForEventType(event);

	const result = teamService.monitorMembershipChanges(payload);

	if (result) {
		sendSuccessResponse(res, result);
	}
});

const reportPrivateRepoRemoved = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

	const event = req.headers["x-github-event"] as ReportGitHubEventType;

	console.log(`Evento recibido para validar creación de repositorios públicos: ${event}`);

	if (event !== "repository") {
		throw new BadRequestError("Evento no soportado. Solo se procesan eventos repository.", "UNSUPPORTED_EVENT");
	}

	const payload = req.body as RepositoryEventPayload;

	if (!payload.repository) {
		throw new BadRequestError("No se encontró información del repositorio.", "INVALID_PAYLOAD");
	}

	const repoService = WebhookServiceFactory.getServiceForEventType(event);

	const result = repoService.monitorPrivateRepositoryRemoved(payload);

	if (result) {
		sendSuccessResponse(res, result);
	}

});

const reportPersonalAccessTokenRequest = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

	const event = req.headers["x-github-event"] as ReportGitHubEventType;

	console.log(`Evento recibido para validar solicitudes de Personal Access Token (PAT): ${event}`);

	if (event !== "personal_access_token_request") {
		throw new BadRequestError("Evento no soportado. Solo se procesan eventos personal_access_token_request.", "UNSUPPORTED_EVENT");
	}

	const payload = req.body as PersonalAccessTokenRequestEventPayload;

	const tokenService = WebhookServiceFactory.getServiceForEventType(event);

	const result = tokenService.monitorPersonalAccessTokenRequests(payload);

	sendSuccessResponse(res, result);

});

export {
	reportDeleteImportantBranch,
	reportDeleteProtectionBranch,
	reportBypassPushRuleset,
	reportMembershipChange,
	reportPrivateRepoRemoved,
	reportPersonalAccessTokenRequest
};