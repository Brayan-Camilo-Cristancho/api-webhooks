import { appConfig } from "../config/index.js";
import type { AlertResponse } from "../types/index.js";

async function sendToTeams(data: AlertResponse) {
	try {
		const teamsWebhookUrl = appConfig.app.comunication;

		if (!teamsWebhookUrl || typeof teamsWebhookUrl !== "string") {
			throw new Error("Teams Webhook URL no está configurado correctamente");
		}

            const getThemeColor = (event: string): string => {
                type EventColorMap = {
                    [key: string]: string;
                    delete: string;
                    branch_protection_rule: string;
                    bypass_request_push_ruleset: string;
                    membership: string;
                    repository: string;
                    personal_access_token_request: string;
                    default: string;
                };
                
                const eventColors: EventColorMap = {
                    'delete': '#CC0000',                     // Rojo - para eliminaciones
                    'branch_protection_rule': '#FF9800',     // Naranja - para cambios en protección
                    'bypass_request_push_ruleset': '#FFD700', // Amarillo dorado - para bypass
                    'membership': '#4CAF50',                 // Verde - para cambios de equipo
                    'repository': '#3F51B5',                 // Azul índigo - para eventos de repositorio
                    'personal_access_token_request': '#9C27B0', // Púrpura - para tokens
                    'default': '#0078D7'                     // Azul corporativo predeterminado
                };
                return eventColors[event] || eventColors.default;
            };

            // Obtiene el ícono adecuado para el tipo de evento
            const getEventIcon = (event: string): string => {
                type EventIconMap = {
                    [key: string]: string;
                    delete: string;
                    branch_protection_rule: string;
                    bypass_request_push_ruleset: string;
                    membership: string;
                    repository: string;
                    personal_access_token_request: string;
                    default: string;
                };
                
                const icons: EventIconMap = {
                    'delete': '🗑️',
                    'branch_protection_rule': '🔒',
                    'bypass_request_push_ruleset': '⚠️',
                    'membership': '👥',
                    'repository': '📁',
                    'personal_access_token_request': '🔑',
                    'default': '🔔'
                };
                return icons[event] || icons.default;
            };

            // Obtiene una imagen relevante para el tipo de evento
            const getEventImage = (event: string): string => {
                type EventImageMap = {
                    [key: string]: string;
                    delete: string;
                    branch_protection_rule: string;
                    bypass_request_push_ruleset: string;
                    membership: string;
                    repository: string;
                    personal_access_token_request: string;
                    default: string;
                };
                
                const images: EventImageMap = {
                    'delete': 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/main/assets/Warning/SVG/ic_fluent_warning_48_regular.svg',
                    'branch_protection_rule': 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/main/assets/Shield/SVG/ic_fluent_shield_48_regular.svg',
                    'bypass_request_push_ruleset': 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/main/assets/Warning/SVG/ic_fluent_warning_48_filled.svg',
                    'membership': 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/main/assets/People/SVG/ic_fluent_people_48_regular.svg',
                    'repository': 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/main/assets/Folder/SVG/ic_fluent_folder_48_regular.svg',
                    'personal_access_token_request': 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/main/assets/Key/SVG/ic_fluent_key_48_regular.svg',
                    'default': 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/main/assets/Alert/SVG/ic_fluent_alert_48_regular.svg'
                };
                return images[event] || images.default;
            };

            // Formatear fecha actual en formato legible
            const now = new Date();
            const formattedDate = now.toLocaleString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Selecciona color corporativo según severidad
            const getSeverityByEvent = (event: string): string => {
                switch (event) {
                    case 'delete':
                    case 'branch_protection_rule':
                        return 'alta';
                    case 'bypass_request_push_ruleset':
                    case 'personal_access_token_request':
                        return 'media';
                    default:
                        return 'baja';
                }
            };
            
            const severity = getSeverityByEvent(data.event);
            const severityColors: Record<string, string> = {
                'alta': '#D71920',    // Rojo corporativo para alta severidad
                'media': '#FFC72C',   // Amarillo para media severidad
                'baja': '#0078D4'     // Azul para baja severidad
            };
            const severityBadges: Record<string, string> = {
                'alta': '🔴 ALTA',
                'media': '🟠 MEDIA',
                'baja': '🔵 BAJA'
            };

            // Logo del Banco de Occidente (puedes reemplazarlo con el logo real)
            const bancoLogo = "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";

            // Construye la tarjeta de Teams con diseño corporativo
            const body = {
                "@type": "MessageCard",
                "@context": "http://schema.org/extensions",
                "themeColor": severityColors[severity] || '#0078D4',
                "summary": `Alerta de Seguridad GitHub: ${data.message || "Notificación de Webhook"}`,
                "sections": [
                    {
                        "activityTitle": `${getEventIcon(data.event)} ${data.message}`,
                        "activitySubtitle": `${formattedDate}`,
                        "activityImage": bancoLogo,
                        "markdown": true
                    },
                    {
                        "startGroup": true,
                        "heroImage": {
                            "image": getEventImage(data.event)
                        },
                        "title": "**Sistema de Monitoreo de Seguridad GitHub**",
                        "text": `**Severidad:** ${severityBadges[severity]}

Este mensaje ha sido generado automáticamente por el sistema de monitoreo de seguridad. Se ha detectado una actividad que requiere su atención.`,
                        "markdown": true
                    },
                    {
                        "startGroup": true,
                        "title": "**Detalles del Evento**",
                        "facts": [
                            { "name": "Tipo de Evento", "value": `**${data.event}**` },
                            ...(data.repository ? [{ "name": "Repositorio", "value": `[${data.repository}](https://github.com/${data.repository})` }] : []),
                            ...(data.branch ? [{ "name": "Rama", "value": `\`${data.branch}\`` }] : []),
                            { "name": "Fecha y Hora", "value": formattedDate },
                            { "name": "Severidad", "value": severityBadges[severity] }
                        ],
                        "markdown": true
                    },
                    {
                        "startGroup": true,
                        "title": "**Mensaje de Alerta**",
                        "text": `> ${data.alert}

*Este es un mensaje automático del Departamento de Seguridad Informática. Por favor no responda a este correo.*`,
                        "markdown": true
                    }
                ],
                "potentialAction": [
                    {
                        "@type": "OpenUri",
                        "name": "📁 Ver Repositorio",
                        "targets": [
                            { "os": "default", "uri": data.repository ? `https://github.com/${data.repository}` : "https://github.com" }
                        ]
                    },
                    {
                        "@type": "OpenUri",
                        "name": "📚 Documentación",
                        "targets": [
                            { "os": "default", "uri": "https://docs.github.com/en/webhooks" }
                        ]
                    },
                    {
                        "@type": "OpenUri",
                        "name": "🔒 Portal de Seguridad",
                        "targets": [
                            { "os": "default", "uri": "https://github.com/security" }
                        ]
                    },
                    {
                        "@type": "OpenUri",
                        "name": "🏦 Banco de Occidente",
                        "targets": [
                            { "os": "default", "uri": "https://www.bancodeoccidente.com.co" }
                        ]
                    }
                ]
            };



		console.log("Enviando notificación a Teams...");
		console.log(teamsWebhookUrl);

		const response = await fetch(teamsWebhookUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			throw new Error(
				`Error enviando notificación a Teams: ${response.status} ${response.statusText}`
			);
		}

		console.log("Notificación enviada correctamente");
	} catch (error) {
		console.error("Error en sendToTeams:", error);
	}
}

export { sendToTeams };