import type { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  GitHubApiError,
  sendSuccessResponse
} from "../utils/index.js";
import { asyncHandler } from "../utils/helpers.js";
import type { GitHubWebhookRequest } from "./typesController.js";
import { octokit } from "../config/index.js";


const generatePullRequest = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

  const webhookReq = req as GitHubWebhookRequest;

  const event = webhookReq.headers["x-github-event"];

  const payload = webhookReq.body;

  console.log(`Evento recibido: ${event}`);

  // if (event !== 'push') {
  //   throw new BadRequestError('Evento no soportado. Solo se procesan eventos push.', 'UNSUPPORTED_EVENT');
  // }

  // if (payload.ref !== 'refs/heads/develop') {
  //   return;
  // }

  const response = await octokit.rest.pulls.create({
    owner: "Brayan-Camilo-Cristancho",
    repo: "api-webhooks",
    title: "✨ Nueva funcionalidad",
    head: "develop",
    base: "main", 
    body: "Este PR agrega una nueva funcionalidad 🚀",
  });
  

  try {

    sendSuccessResponse(res, {
      event,
      message: 'Webhook recibido y procesado correctamente',
      repository: payload.repository?.full_name
    });

  } catch (error) {

    throw new GitHubApiError(
      `Error al procesar webhook: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      500
    );
  }
});

export { generatePullRequest }
