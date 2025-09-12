import type { NextFunction, Request, Response } from "express";
import { BadRequestError, sendSuccessResponse, asyncHandler } from "../../utils/index.js";
import { WebhookServiceFactory } from "../../services/index.js";
import { sendToTeams } from "../../services/comunicationService.js";
import type { BranchProtectionRuleEventPayload, BypassPushRulesetEventPayload, DeleteEventPayload, MembershipEventPayload, PersonalAccessTokenRequestEventPayload, ReportGitHubEventType, RepositoryEventPayload } from "../../core/index.js";

const reportDeleteImportantBranch = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

	const event = req.headers["x-github-event"] as ReportGitHubEventType;

	if (event !== "delete") {
		throw new BadRequestError("Evento no soportado. Solo se procesan eventos delete.", "UNSUPPORTED_EVENT");
	}

	const payload = req.body as DeleteEventPayload;

	if (payload.ref_type !== "branch") {
		throw new BadRequestError("Solo se procesan eliminaciones de ramas.", "INVALID_REF_TYPE");
	}

	sendSuccessResponse(res, { message: "Webhook recibido para ramas borradas" });

	setImmediate(() => {
		try {

			const result = WebhookServiceFactory.getServiceForEventType(event)
				.validateDeletedBranch(payload);

			if (result) sendToTeams(result);

		} catch (error) {
			console.error("Error procesando validateDeletedBranch:", error);
		}
	});

});

const reportDeleteProtectionBranch = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

	const event = req.headers["x-github-event"] as ReportGitHubEventType;

	if (event !== "branch_protection_rule") {
		throw new BadRequestError("Evento no soportado. Solo se procesan branch_protection_rule.", "UNSUPPORTED_EVENT");
	}

	const payload = req.body as BranchProtectionRuleEventPayload;

	sendSuccessResponse(res, { message: "Webhook recibido para branch protection removal" });

	setImmediate(() => {

		try {
			const result = WebhookServiceFactory.getServiceForEventType(event)
				.validateBranchProtectionRemoval(payload);

			console.log("Resultado de validateBranchProtectionRemoval:", result);

			if (result) sendToTeams(result);

		} catch (error) {
			console.error("Error procesando validateBranchProtectionRemoval:", error);
		}
	});

});

const reportBypassPushRuleset = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

	const event = req.headers["x-github-event"] as ReportGitHubEventType;

	if (event !== "bypass_request_push_ruleset") {
		throw new BadRequestError("Evento no soportado. Solo se procesan bypass_request_push_ruleset.", "UNSUPPORTED_EVENT");
	}

	const payload = req.body as BypassPushRulesetEventPayload;

	sendSuccessResponse(res, { message: "Webhook recibido para bypass push ruleset" });

	setImmediate(() => {

		try {
			const result = WebhookServiceFactory.getServiceForEventType(event)
				.monitorBypassPushRuleset(payload);

			if (result) sendToTeams(result);

		} catch (error) {
			console.error("Error procesando monitorBypassPushRuleset:", error);
		}
	});

});

const reportMembershipChange = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

	const event = req.headers["x-github-event"] as ReportGitHubEventType;

	if (event !== "membership") {
		throw new BadRequestError("Evento no soportado. Solo se procesan eventos membership.", "UNSUPPORTED_EVENT");
	}

	const payload = req.body as MembershipEventPayload;

	sendSuccessResponse(res, { message: "Webhook recibido para cambios de membresía" });

	setImmediate(() => {

		try {
			const result = WebhookServiceFactory.getServiceForEventType(event)
				.monitorMembershipChanges(payload);

			if (result) sendToTeams(result);

		} catch (error) {
			console.error("Error procesando monitorMembershipChanges:", error);
		}
	});

});

const reportPrivateRepoRemoved = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

	const event = req.headers["x-github-event"] as ReportGitHubEventType;

	if (event !== "repository") {
		throw new BadRequestError("Evento no soportado. Solo se procesan eventos repository.", "UNSUPPORTED_EVENT");
	}

	const payload = req.body as RepositoryEventPayload;

	if (!payload.repository) {
		throw new BadRequestError("No se encontró información del repositorio.", "INVALID_PAYLOAD");
	}

	sendSuccessResponse(res, { message: "Webhook recibido para repositorios privados eliminados" });

	setImmediate(() => {

		try {
			const result = WebhookServiceFactory.getServiceForEventType(event)
				.monitorPrivateRepositoryRemoved(payload);

			if (result) sendToTeams(result);

		} catch (error) {
			console.error("Error procesando monitorPrivateRepositoryRemoved:", error);
		}
	});
});

const reportPersonalAccessTokenRequest = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

	const event = req.headers["x-github-event"] as ReportGitHubEventType;

	if (event !== "personal_access_token_request") {
		throw new BadRequestError("Evento no soportado. Solo se procesan eventos personal_access_token_request.", "UNSUPPORTED_EVENT");
	}

	const payload = req.body as PersonalAccessTokenRequestEventPayload;

	sendSuccessResponse(res, { message: "Webhook recibido para solicitudes de PAT" });

	setImmediate(() => {

		try {
			const result = WebhookServiceFactory.getServiceForEventType(event)
				.monitorPersonalAccessTokenRequests(payload);

			if (result) sendToTeams(result);
			
		} catch (error) {
			console.error("Error procesando monitorPersonalAccessTokenRequests:", error);
		}
	});

});

export {
	reportDeleteImportantBranch,
	reportDeleteProtectionBranch,
	reportBypassPushRuleset,
	reportMembershipChange,
	reportPrivateRepoRemoved,
	reportPersonalAccessTokenRequest
};