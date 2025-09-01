import type { GitHubUser } from "./user.js";

export interface GitHubCommit {
  id: string;
  message: string;
  author: GitHubUser;
}