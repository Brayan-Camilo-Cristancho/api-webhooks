import type { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  sendSuccessResponse,
  asyncHandler
} from "../../utils/index.js";
import { WebhookServiceFactory } from "../../services/index.js";
import { sendToTeams } from "../../services/comunicationService.js";
import type { GitHubPushEvent, ReportGitHubEventType } from "../../core/index.js";

const changesGeneratePullRequest = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

  const payload = req.body as GitHubPushEvent;

  const event = req.headers["x-github-event"] as ReportGitHubEventType;

  console.log(`Evento recibido para generar pull request: ${event}`);

  if (event !== 'push') {
    throw new BadRequestError('Evento no soportado. Solo se procesan eventos push.', 'UNSUPPORTED_EVENT');
  }

  const securityService = WebhookServiceFactory.getServiceForEventType(event);

  const result = await securityService.generatePullRequest(payload);

  if (result) {
    sendToTeams(result);
    sendSuccessResponse(res, result);
  }

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
    return;
  }

  const securityService = WebhookServiceFactory.getServiceForEventType(event);

  const result = await securityService.changesFolderConfig(payload);

  if (result) {
    sendToTeams(result);
    sendSuccessResponse(res, result);
  }

});

const validateChangesPushUser = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

  const payload = req.body as GitHubPushEvent;

  const event = req.headers["x-github-event"] as ReportGitHubEventType;

  if (event !== 'push') {
    throw new BadRequestError('Evento no soportado. Solo se procesan eventos push.', 'UNSUPPORTED_EVENT');
  }

  const securityService = WebhookServiceFactory.getServiceForEventType(event);

  const result = await securityService.monitorPushUser(payload);

  if (result) {
    sendToTeams(result);
    sendSuccessResponse(res, result);
  }

});

const validateForcePush = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

  const payload = req.body as GitHubPushEvent;

  const event = req.headers["x-github-event"] as ReportGitHubEventType;

  if (event !== 'push') {
    throw new BadRequestError('Evento no soportado. Solo se procesan eventos push.', 'UNSUPPORTED_EVENT');
  }

  const securityService = WebhookServiceFactory.getServiceForEventType(event);

  const result = await securityService.forcePush(payload);

  if (result) {
    sendToTeams(result);
    sendSuccessResponse(res, result);
  }

});

const validateMonitorPushUser = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

  const payload = req.body as GitHubPushEvent;

  const event = req.headers["x-github-event"] as ReportGitHubEventType;

  // if (event !== 'push') {
  //   throw new BadRequestError('Evento no soportado. Solo se procesan eventos push.', 'UNSUPPORTED_EVENT');
  // }

  const securityService = WebhookServiceFactory.getServiceForEventType(event);

  const result = await securityService.monitorPushUser(payload);

  if (result) {
    sendToTeams(result);
    sendSuccessResponse(res, result);
  }

});



export { validateChangesFolderConfig, validateChangesPushUser, changesGeneratePullRequest, validateForcePush, validateMonitorPushUser };
