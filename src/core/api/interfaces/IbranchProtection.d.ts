
export interface BranchProtection {
	requiredApprovals: number;
	requireCodeOwnerReviews: boolean;
	allowedUsers: string[];
	allowedTeams: string[];
	enforceAdmins: boolean;
}