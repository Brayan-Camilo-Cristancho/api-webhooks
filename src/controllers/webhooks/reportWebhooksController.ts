import type { NextFunction, Request, Response } from "express";
import { BadRequestError, sendSuccessResponse, asyncHandler } from "../../utils/index.js";
import { WebhookServiceFactory } from "../../services/index.js";
import { sendToPowerAutomate } from "../../services/comunicationService.js";
import type { BranchProtectionRuleEventPayload, DeleteEventPayload, ReportGitHubEventType, RepositoryEventPayload } from "../../core/index.js";

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

			if (result) sendToPowerAutomate(result);

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

			if (result) sendToPowerAutomate(result);

		} catch (error) {
			console.error("Error procesando validateBranchProtectionRemoval:", error);
		}
	});

});

const reportPrivateRepoRemoved = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

	const event = req.headers["x-github-event"] as ReportGitHubEventType;

	if (event !== "repository") {
		throw new BadRequestError("Evento no soportado. Solo se procesan eventos repository.", "UNSUPPORTED_EVENT");
	}

	const payload = req.body as any;

	console.log("Payload recibido en reportPrivateRepoRemoved:", payload);

	if (!payload.payload.repository) {
		throw new BadRequestError("No se encontró información del repositorio.", "INVALID_PAYLOAD");
	}

	sendSuccessResponse(res, { message: "Webhook recibido para repositorios privados eliminados" });

	setImmediate(() => {

		try {
			const result = WebhookServiceFactory.getServiceForEventType(event)
				.monitorPrivateRepositoryRemoved(payload);

			if (result) sendToPowerAutomate(result);

		} catch (error) {
			console.error("Error procesando monitorPrivateRepositoryRemoved:", error);
		}
	});
});
;

export {
	reportDeleteImportantBranch,
	reportDeleteProtectionBranch,
	reportPrivateRepoRemoved
};