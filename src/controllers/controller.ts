import type { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  GitHubApiError,
  sendSuccessResponse
} from "../utils/index.js";
import { asyncHandler } from "../utils/index.js";
import type { GitHubWebhookRequest } from "./types/typesController.js";
import { octokit } from "../auth/index.js";



const generatePullRequest = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

  const webhookReq = req as GitHubWebhookRequest;

  const event = webhookReq.headers["x-github-event"];

  const payload = webhookReq.body;

  console.log(`Evento recibido: ${event}`);

  if (event !== 'push') {
    throw new BadRequestError('Evento no soportado. Solo se procesan eventos push.', 'UNSUPPORTED_EVENT');
  }

  const branch = /release|develop/gi;

  if (!branch.test(payload.ref)) {
    console.log(`Evento recibido en rama no soportada: ${payload.ref}`);
    return;
  }

  const response = await octokit.rest.pulls.create({
    owner: payload.repository.owner.name,
    repo: payload.repository.name,
    title: ":robot: Pull request generated automatically",
    head: payload.ref,
    base: "main",
    body: `Pull request generado automáticamente desde la rama ${payload.ref} por el webhook de GitHub. Para el commit ${payload.commits[0]?.id}, con la siguiente especificación: ${payload.commits[0]?.message}`,
  });

  try {

    sendSuccessResponse(res, {
      event,
      message: `Webhook recibido y procesado correctamente se creo el pull request ${response.data.html_url}`,
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
