import type { ReportGitHubEventType } from '../../types/index.js';
import {
  SecurityWebhookService,
  TeamWebhookService,
  RepositoryWebhookService,
  TokenWebhookService
} from './webhookServices.js';


export class WebhookServiceFactory {

  private static securityService: SecurityWebhookService;
  private static teamService: TeamWebhookService;
  private static repositoryService: RepositoryWebhookService;
  private static tokenService: TokenWebhookService;

  static getServiceForEventType(eventType: ReportGitHubEventType): any {

    if (!this.securityService) {
      this.securityService = new SecurityWebhookService();
      this.teamService = new TeamWebhookService();
      this.repositoryService = new RepositoryWebhookService();
      this.tokenService = new TokenWebhookService();
    }

    switch (eventType) {
      case 'delete':
      case 'branch_protection_rule':
      case 'bypass_request_push_ruleset':
        return this.securityService;
      case 'membership':
        return this.teamService;
      case 'repository':
        return this.repositoryService;
      case 'personal_access_token_request':
        return this.tokenService;
      case 'push':
        return this.repositoryService;
      default:
        throw new Error(`No hay servicio configurado para el evento: ${eventType}`);
    }
  }
}
