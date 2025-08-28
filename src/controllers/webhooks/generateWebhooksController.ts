import type { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  sendSuccessResponse
} from "../../utils/index.js";
import { asyncHandler } from "../../utils/index.js";
import { octokit } from "../../auth/index.js";
import type { GitHubWebhookRequest } from "../../types/index.js"

const ChangesGeneratePullRequest = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

  const webhookReq = req as GitHubWebhookRequest;

  const event = webhookReq.headers["x-github-event"];

  const payload = webhookReq.body;

  console.log(`Evento recibido para generar pull request: ${event}`);

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

  sendSuccessResponse(res, {
    event,
    message: `Webhook recibido y procesado correctamente se creo el pull request ${response.data.html_url}`,
    repository: payload.repository?.full_name
  });

});

const ChangesFolderConfig = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

  const event = req.headers["x-github-event"];
  const payload = req.body;
  const { commits, repository } = payload;
  const branch = payload.ref;
  let alertMessages: string[] = [];

  console.log(`Evento recibido para validar cambios en config: ${event}`);

  if (event !== "push") {
    throw new BadRequestError("Evento no soportado. Solo se procesan eventos push.", "UNSUPPORTED_EVENT");
  }

  if (branch !== "refs/heads/main") {
    return;
  }

  commits.forEach((commit: any) => {

    const protectedFiles = commit.modified.filter((f: string) => f.startsWith("config/Jenkinsfile"));

    if (protectedFiles.length > 0) {
      const message =
        `Carpeta protegida modificada en el repositorio ${repository.full_name} por el usuario ${commit.author.username}
       Archivos: ${protectedFiles.join(", ")}
       Commit: ${commit.url}
       Mensaje: "${commit.message}"`;

      alertMessages.push(message);
    }

  });

  sendSuccessResponse(res, {
    event,
    message: "Webhook recibido y procesado correctamente, se crea alerta de carpeta protegida",
    repository: repository.full_name,
    alerts: alertMessages
  });

});

export { ChangesFolderConfig, ChangesGeneratePullRequest }
