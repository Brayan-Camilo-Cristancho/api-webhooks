import { appConfig } from "../config/appConfig.js";
import type { AlertResponse } from "../core/index.js";
import cardAlertTemplate from "../templates/cardAlertTeams.json" with { type: "json" };
import { fillTemplate, mapSeverityConfig } from "../utils/helpers.js";

const createTeamsMessage = (data: AlertResponse) => {

  const severity = mapSeverityConfig(data.category || "notify");

  const getStatus = (value: string) => {
    if (!value || value === "N/A") {
      return { icon: "CheckboxUnchecked", color: "Attention" };
    }
    return { icon: "CheckboxChecked", color: "Good" };
  };
  
  const tipoEventoStatus = getStatus(data.event || "N/A");
  const repoStatus = getStatus(data.repository || "N/A");
  const branchStatus = getStatus(data.branch || "N/A");
  const dateStatus = getStatus(new Date().toLocaleString("es-ES"));
  const actorStatus = getStatus(data.actor || "N/A");

  const replacements: Record<string, string> = {
    summary: `Alerta de Webhook: ${data.message}`,
    "title-card": data.message,
    "sub-title": new Date().toLocaleString("es-ES"),
    image: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    "image-alert":
      "https://raw.githubusercontent.com/microsoft/fluentui-system-icons/main/assets/Alert/SVG/ic_fluent_alert_48_regular.svg",
    "tipo-evento": data.event || "N/A",
    tipoEventoStatus: tipoEventoStatus.icon,
    tipoEventoColor: tipoEventoStatus.color,
    repository: data.repository || "N/A",
    repositoryStatus: repoStatus.icon,
    repositoryColor: repoStatus.color,
    branch: data.branch || "N/A",
    branchStatus: branchStatus.icon,
    branchColor: branchStatus.color,
    formattedDate: new Date().toLocaleString("es-ES"),
    dateStatus: dateStatus.icon,
    dateColor: dateStatus.color,
    actor: data.actor || "N/A",
    actorStatus: actorStatus.icon,
    actorColor: actorStatus.color,
    alert: data.alert,
    severityBadge: 'Categoría: ' + severity?.badge || "notify"
  };

  return fillTemplate(cardAlertTemplate, replacements);

};



const sendToPowerAutomate = async (data: AlertResponse) => {
  try {

    const powerAutomateUrl = appConfig.app.communication;

    if (!powerAutomateUrl) throw new Error("Power Automate URL no está configurada");

    const body = createTeamsMessage(data);

    const response = await fetch(powerAutomateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(`Error enviando a Power Automate: ${response.status}`);

    console.log("Notificación enviada correctamente a Power Automate");

  } catch (err) {

    console.error("Error en sendToPowerAutomate:", err);

  }

};


export { sendToPowerAutomate };
