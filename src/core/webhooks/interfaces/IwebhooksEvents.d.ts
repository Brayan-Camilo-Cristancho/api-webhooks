import type { GitHubCommit } from "../common/commit.ts";
import type { GitHubOrganization } from "../common/organization.ts";
import type { GitHubRepository } from "../common/repository.ts";
import type { GitHubUser } from "../common/user.ts";

export interface GitHubPushEvent {
  ref: string;
  repository: GitHubRepository;
  commits: GitHubCommit[];
  pusher?: GitHubUser;
  sender?: GitHubUser;
}

export interface DeleteEventPayload {
  ref: string;
  ref_type: 'branch';
  repository: GitHubRepository;
  sender: GitHubUser;
}

export interface BranchProtectionRuleEventPayload {
  action: 'created' | 'edited' | 'deleted' | string;
  rule?: { name: string };
  repository: GitHubRepository;
}

export interface BypassPushRulesetEventPayload {
  action: string;
  bypass_request?: {
    actor?: GitHubUser;
    target?: { ref?: string };
    state?: string;
  };
  repository: GitHubRepository;
}

export interface MembershipEventPayload {
  action: 'added' | 'removed' | string;
  member?: GitHubUser;
  team?: { name: string };
  organization?: GitHubOrganization;
  sender?: GitHubUser;
}

export interface RepositoryEventPayload {
  before?: string;
  after?: string;
  commits: GitHubCommit[];
  ref?: string;
  action: 'created' | 'deleted' | string;
  repository: GitHubRepository;
  organization?: GitHubOrganization;
  pusher?: GitHubUser;
  sender?: GitHubUser;
  head_commit: {
    author: {
      name: string
      email: string,
      username?: string
    },
    committer: {
      name: string,
      email: string
    }
  }
}

export interface PersonalAccessTokenRequestEventPayload {
  action: 'created' | 'approved' | 'denied' | string;
  personal_access_token_request?: {
    owner?: GitHubUser;
    scopes?: string[];
    state?: string;
  };
  organization?: GitHubOrganization;
}

export type GitHubWebhookEvent =
  | { type: 'push'; payload: GitHubPushEvent }
  | { type: 'delete'; payload: DeleteEventPayload }
  | { type: 'branch_protection_rule'; payload: BranchProtectionRuleEventPayload }
  | { type: 'bypass_push_ruleset'; payload: BypassPushRulesetEventPayload }
  | { type: 'membership'; payload: MembershipEventPayload }
  | { type: 'repository'; payload: RepositoryEventPayload }
  | { type: 'personal_access_token_request'; payload: PersonalAccessTokenRequestEventPayload };

export interface WebhookStrategy<TPayload> {
  supports(event: string): boolean;
  handle(payload: TPayload): AlertResponse | null | Promise<AlertResponse | null>;
}
