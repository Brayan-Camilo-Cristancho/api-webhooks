import type { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  sendSuccessResponse,
  asyncHandler
} from "../../utils/index.js";
import { WebhookServiceFactory } from "../../services/index.js";
import { sendToPowerAutomate } from "../../services/index.js";
import type { AlertResponse, GitHubPushEvent, ReportGitHubEventType } from "../../core/index.js";

const changesGeneratePullRequest = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

  const payload = req.body as GitHubPushEvent;

  const event = req.headers["x-github-event"] as ReportGitHubEventType;

  console.log(`Evento recibido para generar pull request: ${event}`);

  if (event !== "push") {
    throw new BadRequestError("Evento no soportado. Solo se procesan eventos push.", "UNSUPPORTED_EVENT");
  }

  sendSuccessResponse(res, { message: "Webhook recibido para generar pull request" });

  setImmediate(() => {
    try {

      WebhookServiceFactory.getServiceForEventType(event)
        .generatePullRequest(payload);

    } catch (error) {

      console.error("Error procesando changesGeneratePullRequest:", error);

    }
  });

});

const validateChangesFolderConfig = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

  const payload = req.body as GitHubPushEvent;

  const event = req.headers["x-github-event"] as ReportGitHubEventType;

  const branch = payload.ref;

  console.log(`Evento recibido para validar cambios en config: ${event}`);

  if (event !== "push") {
    throw new BadRequestError("Evento no soportado. Solo se procesan eventos push.", "UNSUPPORTED_EVENT");
  }

  if (branch !== "refs/heads/main") {
    return res.status(200).json({ message: "No es la rama main, no se procesa." });
  }

  sendSuccessResponse(res, { message: "Webhook recibido para validar cambios en config" });

  setImmediate(() => {
    try {

      const result = WebhookServiceFactory.getServiceForEventType(event)
        .changesFolderConfig(payload);

      if (result) sendToPowerAutomate(result);

    } catch (error) {
      console.error("Error procesando validateChangesFolderConfig:", error);
    }
  });

});

const validateChangesPushUser = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

  const payload = req.body as GitHubPushEvent;

  const event = req.headers["x-github-event"] as ReportGitHubEventType;

  if (event !== "push") {
    throw new BadRequestError("Evento no soportado. Solo se procesan eventos push.", "UNSUPPORTED_EVENT");
  }

  sendSuccessResponse(res, { message: "Webhook recibido para validar cambios de usuario" });

  setImmediate(() => {
    WebhookServiceFactory.getServiceForEventType(event)
      .monitorPushUser(payload)
      .then((result: AlertResponse | null) => {
        if (result) sendToPowerAutomate(result);
      })
      .catch((error: Error) => {
        console.error("Error procesando monitorPushUser:", error);
      });
  });

});



export { validateChangesFolderConfig, validateChangesPushUser, changesGeneratePullRequest };
