import { Octokit } from "octokit";
import { GitHubApiError } from "../utils/index.js";
import { appConfig } from "../config/index.js";


const octokit = new Octokit({ auth: appConfig.app.GitHubTokenApi });

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