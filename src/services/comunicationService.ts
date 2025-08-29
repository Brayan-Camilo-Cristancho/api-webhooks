import { appConfig } from "../config/index.js";
import type { AlertResponse } from "../types/index.js";

async function sendToTeams(data: AlertResponse) {

	const teamsWebhookUrl = appConfig.app.comunication;

	await fetch(teamsWebhookUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
}

export { sendToTeams };