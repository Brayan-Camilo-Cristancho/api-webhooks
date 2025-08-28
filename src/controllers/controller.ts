import type { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  sendSuccessResponse
} from "../utils/index.js";
import { asyncHandler } from "../utils/index.js";
import { octokit } from "../auth/index.js";
import type { GitHubWebhookRequest } from "../types/index.js"

const generatePullRequest = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

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

const reportChangesFolderConfig = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

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

const reportDeleteImportantBranch = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {

  const event = req.headers["x-github-event"];
  const payload = req.body;
  const branch = payload.ref;
  const repository = payload.repository?.full_name;

  const IMPORTANT_BRANCHES = ["main", "develop", "quality"];

  console.log(`Evento recibido para validar ramas importantes borradas`);

  if (event !== "delete") {
    throw new BadRequestError("Evento no soportado. Solo se procesan eventos delete.", "UNSUPPORTED_EVENT");
  }

  if (payload.ref_type !== "branch") {
    throw new BadRequestError("Solo se procesan eliminaciones de ramas.", "INVALID_REF_TYPE");
  }


  if (branch !== "refs/heads/main") {
    return;
  }

  if (!IMPORTANT_BRANCHES.includes(branch)) {
    return;
  }

  sendSuccessResponse(res, {
    event,
    message: "Webhook recibido y procesado correctamente, se crea alerta de carpeta protegida",
    repository: repository.full_name,
    alerts: `Alerta: Se eliminó la rama protegida ${branch} en el repo ${repository}`
  });

});

const reportDeleteProtectionBranch = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;
  const IMPORTANT_BRANCHES = ["main"];

  console.log(`Evento recibido para validar eliminación de protección en ramas`);

  if (event !== "branch_protection_rule") {
    throw new BadRequestError("Evento no soportado. Solo se procesan branch_protection_rule.", "UNSUPPORTED_EVENT");
  }

  const action = payload.action;

  const branchName = payload.rule?.name;

  const repositoryFullName = payload.repository?.full_name

  if (action !== "deleted") {
    return;
  }

  if (!IMPORTANT_BRANCHES.includes(branchName)) {
    return;
  }

  sendSuccessResponse(res, {
    event,
    message: "Protección de rama eliminada",
    repository: repositoryFullName,
    branch: branchName,
    alert: `Se eliminó la protección de la rama "${branchName}" en el repositorio ${repositoryFullName}.`,
  });
});

const reportBypassPushRuleset = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  console.log(`Evento recibido para validar incumplimiento de reglas de push`);

  if (event !== "bypass_request_push_ruleset") {
    throw new BadRequestError("Evento no soportado. Solo se procesan bypass_request_push_ruleset.", "UNSUPPORTED_EVENT");
  }

  const action = payload.action;

  const actor = payload.bypass_request?.actor?.login || "desconocido";

  const branch = payload.bypass_request?.target?.ref?.replace("refs/heads/", "");

  const repository = payload.repository?.full_name;

  const state = payload.bypass_request?.state;

  sendSuccessResponse(res, {
    event,
    message: "Solicitud de bypass detectada",
    repository,
    branch,
    action,
    state,
    alert: `Solicitud de bypass (${action}) en la rama "${branch}" del repositorio ${repository} por el usuario ${actor}. Estado: ${state}`,
  });
});

const reportMembershipChange = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {
  
  const event = req.headers["x-github-event"];
  const payload = req.body;

  console.log(`Evento recibido para validar cambios en membresía de equipos`);

  if (event !== "membership") {
    throw new BadRequestError("Evento no soportado. Solo se procesan eventos membership.", "UNSUPPORTED_EVENT");
  }

  const action = payload.action;
  const member = payload.member?.login;
  const team = payload.team?.name;
  const organization = payload.organization?.login;
  const sender = payload.sender?.login;

  if (action !== "added" && action !== "removed") {
    return res.status(200).json({
      message: `Evento ignorado, acción: ${action}`,
    });
  }

  const alertMessage =
    action === "added"
      ? `El usuario ${member} fue agregado al equipo ${team} en la organización ${organization} por ${sender}.`
      : `El usuario ${member} fue eliminado del equipo ${team} en la organización ${organization} por ${sender}.`;

  sendSuccessResponse(res, {
    event,
    message: `Cambio en membresía detectado: ${action}`,
    organization,
    team,
    member,
    changed_by: sender,
    alert: alertMessage,
  });
});

const reportPublicRepoCreated = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  console.log(`Evento recibido para validar creación de repositorios públicos`);

  if (event !== "repository") {
    throw new BadRequestError("Evento no soportado. Solo se procesan eventos repository.", "UNSUPPORTED_EVENT");
  }

  const action = payload.action;
  const repo = payload.repository;
  const org = payload.organization?.login || "organización desconocida";
  const creator = payload.sender?.login || "desconocido";

  if (action !== "created") {
    return res.status(200).json({
      message: `Evento ignorado, acción: ${action}`,
    });
  }

  if (!repo) {
    throw new BadRequestError("No se encontró información del repositorio.", "INVALID_PAYLOAD");
  }

  const repoName = repo.full_name;
  const repoUrl = repo.html_url;
  const isPublic = !repo.private;

  if (isPublic) {
    sendSuccessResponse(res, {
      event,
      message: "Repositorio público creado",
      organization: org,
      repository: repoName,
      url: repoUrl,
      created_by: creator,
      alert: `Se creó un repositorio PÚBLICO (${repoName}) en la organización ${org} por ${creator}. URL: ${repoUrl}`,
    });
  } else {
    return res.status(200).json({
      message: `Repositorio creado pero es privado: ${repoName}`,
    });
  }
});

const reportPersonalAccessTokenRequest = asyncHandler(async (req: Request, res: Response, _: NextFunction) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  console.log(`Evento recibido para validar solicitudes de Personal Access Token (PAT)`);

  if (event !== "personal_access_token_request") {
    throw new BadRequestError("Evento no soportado. Solo se procesan eventos personal_access_token_request.", "UNSUPPORTED_EVENT");
  }

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

  sendSuccessResponse(res, {
    event,
    message: `Evento PAT detectado: ${action}`,
    organization: org,
    user,
    scopes,
    state,
    alert: alertMessage,
  });
});




export { generatePullRequest, reportChangesFolderConfig }
