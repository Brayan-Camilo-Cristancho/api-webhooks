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

export interface GitHubPushEvent {
  ref: string;
  repository: {
    name: string;
    full_name: string;
    owner: {
      login: string;
      name: string;
    };
  };
  commits: Array<{
    id: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
  }>;
}

export interface DeleteEventPayload {
  ref: string;
  ref_type: 'branch';
  repository: {
    full_name: string;
    name: string;
  };
}

export interface BranchProtectionRuleEventPayload {
  action: 'created' | 'edited' | 'deleted' | string;
  rule?: {
    name: string;
  };
  repository: {
    full_name: string;
    name: string;
  };
}

export interface BypassPushRulesetEventPayload {
  action: string;
  bypass_request?: {
    actor?: {
      login: string;
    };
    target?: {
      ref?: string;
    };
    state?: string;
  };
  repository: {
    full_name: string;
    name: string;
  };
}

export interface MembershipEventPayload {
  action: 'added' | 'removed' | string;
  member?: {
    login: string;
  };
  team?: {
    name: string;
  };
  organization?: {
    login: string;
  };
  sender?: {
    login: string;
  };
}

export interface RepositoryEventPayload {
  before?: string;
  after?: string;
  commits: {
    id: string;
    message: string;
    author: {
      name: string;
      email: string;
      username?: string
    };
  }[];
  ref?: string;
  action: 'created' | 'deleted' | string;
  repository: {
    full_name: string;
    name: string;
    html_url: string;
    private: boolean;
  };
  organization?: {
    login: string;
  };
  pusher?: {
    name: string;
    email: string
  }
  sender?: {
    login: string;
    id: number;
  };
}

export interface PersonalAccessTokenRequestEventPayload {
  action: 'created' | 'approved' | 'denied' | string;
  personal_access_token_request?: {
    owner?: {
      login: string;
    };
    scopes?: string[];
    state?: string;
  };
  organization?: {
    login: string;
  };
}

export interface AlertResponse {
  event: string;
  message: string;
  repository?: string | undefined;
  branch?: string | undefined;
  alert: string;
}
