export type Role = 'admin' | 'member' | 'approver';

export interface ReportRoleUsers {
	user_or_team: string;
	repo: Set<string>;
	branch: string;
	role: Role;
}
