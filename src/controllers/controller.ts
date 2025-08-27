import type { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  GitHubApiError,
  sendSuccessResponse
} from "../utils/index.js";
import { asyncHandler } from "../utils/index.js";
import { octokit } from "../auth/index.js";
import type { GitHubWebhookRequest } from "../types/index.js"



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


const validateChangesFolderConfig = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

  const event = req.headers["x-github-event"];

  const payload = req.body;

  console.log(`Evento recibido: ${event}`);

  if (event !== "push") {
    throw new BadRequestError("Evento no soportado. Solo se procesan eventos push.", "UNSUPPORTED_EVENT");
  }

  const { commits, repository } = payload;

  console.log(`Commits recibidos: ${commits.length}`);

  let alertMessages: string[] = [];

  commits.map((c: any) => {
    const protectedFiles = c.modified.filter((f: string) => f.startsWith("config/Jenkinsfile"));

    if (protectedFiles.length > 0) {
      const message = `⚠️ Carpeta protegida modificada en el repositorio **${repository.full_name}** por **${c.author.username}**
      📄 Archivos: ${protectedFiles.join(", ")}
      📝 Commit: ${c.url}
      🗒️ Mensaje: "${c.message}"`;

      alertMessages.push(message);
    }

  });

  if (alertMessages.length > 0) {
    console.log("Alertas detectadas:");
    alertMessages.forEach(msg => console.log(msg));

  }

  sendSuccessResponse(res, {
    event,
    message: "Webhook recibido y procesado correctamente",
    repository: repository.full_name,
    alerts: alertMessages.length
  });
});

export { generatePullRequest, validateChangesFolderConfig }
