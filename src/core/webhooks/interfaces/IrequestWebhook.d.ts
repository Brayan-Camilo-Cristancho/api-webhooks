import type { Request } from 'express';

export type ReportGitHubEventType =
  | 'delete'
  | 'branch_protection_rule'
  | 'bypass_request_push_ruleset'
  | 'membership'
  | 'repository'
  | 'personal_access_token_request'
  | string;

export interface ReportGitHubWebhookRequest extends Request {
  body: any;
  headers: Request['headers'] & {
	'x-github-event': ReportGitHubEventType;
  };
}