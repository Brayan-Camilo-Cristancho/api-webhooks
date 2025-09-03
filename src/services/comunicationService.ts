import { appConfig } from "../config/appConfig.js";
import type { AlertResponse } from "../core/index.js";
import cardAlertTemplate from "../templates/cardAlertTeams.json" with { type: "json" };
import { fillTemplate, mapSeverityConfig } from "../utils/helpers.js";


function createTeamsMessage(data: AlertResponse) {
  const severity = mapSeverityConfig(data.category || "notify");

  const replacements: Record<string, string> = {
    summary: `Alerta de Webhook: ${data.message}`,
    "title-card": data.message,
    "sub-title": new Date().toLocaleString("es-ES"),
    image: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    "image-alert":
      "https://raw.githubusercontent.com/microsoft/fluentui-system-icons/main/assets/Alert/SVG/ic_fluent_alert_48_regular.svg",
    "tipo-evento": data.event,
    repository: data.repository || "N/A",
    branch: data.branch || "N/A",
    formattedDate: new Date().toLocaleString("es-ES"),
    actor: "usuario-demo",
    alert: data.alert,
    severityBadge: severity?.badge || 'notify', 
    themeColor: severity?.color || '#333',
  };


  const message = fillTemplate(cardAlertTemplate, replacements);

  message.potentialAction.push({
    "@type": "OpenUri",
    name: "📚 Documentación",
    targets: [{ os: "default", uri: "https://docs.github.com/en/webhooks" }],
  });

  return message;
}

async function sendToTeams(data: AlertResponse) {
  try {
    
    const teamsWebhookUrl = appConfig.app.comunication;

    if (!teamsWebhookUrl) throw new Error("Teams Webhook URL no está configurado");

    const body = createTeamsMessage(data);

    const response = await fetch(teamsWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(`Error enviando notificación: ${response.status}`);

    console.log("Notificación enviada correctamente a Teams");
    
  } catch (err) {
    console.error("Error en sendToTeams:", err);
  }
}

export { sendToTeams };
