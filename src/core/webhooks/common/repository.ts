import type { GitHubUser } from "./user.js";

export interface GitHubRepository {
  name: string;
  full_name: string;
  html_url?: string;
  private?: boolean;
  owner?: GitHubUser;
}