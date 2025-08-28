export type Role = 'admin' | 'member' | 'approver';

export interface InfoUsers {
	user_or_team: string;
	repo: Set<string>;
	branch: string;
	role: Role;
}
