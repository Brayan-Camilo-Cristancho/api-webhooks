import { Octokit } from "octokit";
import { GitHubApiError } from "../utils/index.js";
import * as dotenv from "dotenv";

dotenv.config();

const octokit = new Octokit({ auth: process.env.GITHUB_SECRET_API });

const authApi = async () => {

	try {
		const {
			data: { login },
		} = await octokit.rest.users.getAuthenticated();

		console.log(`Login generated at: ${new Date().toLocaleString()} - data: ${login}`);

	} catch (error) {
		throw new GitHubApiError(`Error en la API de GitHub`, 500);
	}


}

export { authApi, octokit }