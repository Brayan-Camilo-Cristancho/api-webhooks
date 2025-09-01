import type { BranchProtection } from "./IbranchProtection.js";

export interface RepositoryData {
	name: string,
	full_name: string,
	private: boolean,
	url: string,
	updated_at: string,
	forks_count: number,
	created_at: string,
	protection?: BranchProtection | null
}