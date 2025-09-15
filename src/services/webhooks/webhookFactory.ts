import type { ReportGitHubEventType } from '../../core/index.js';
import {
  SecurityWebhookService,
  TeamWebhookService,
  RepositoryWebhookService,
  TokenWebhookService
} from './webhookServices.js';

export class WebhookServiceFactory {

  private static securityService?: SecurityWebhookService;
  private static teamService?: TeamWebhookService;
  private static repositoryService?: RepositoryWebhookService;
  private static tokenService?: TokenWebhookService;

  private static readonly serviceMap: Record<ReportGitHubEventType, () => any> = {
    delete: () => (this.securityService ??= new SecurityWebhookService()),
    branch_protection_rule: () => (this.securityService ??= new SecurityWebhookService()),
    bypass_request_push_ruleset: () => (this.securityService ??= new SecurityWebhookService()),
    membership: () => (this.teamService ??= new TeamWebhookService()),
    repository: () => (this.repositoryService ??= new RepositoryWebhookService()),
    personal_access_token_request: () => (this.tokenService ??= new TokenWebhookService()),
    push: () => (this.repositoryService ??= new RepositoryWebhookService(), this.securityService ??= new SecurityWebhookService()),
  };

  static getServiceForEventType(eventType: ReportGitHubEventType): any {
    const service = this.serviceMap[eventType];
    if (!service) throw new Error(`No hay servicio configurado para el evento: ${eventType}`);
    return service();
  }
}
