import { Router } from "express";
import {
  changesGeneratePullRequest,
  reportDeleteImportantBranch,
  reportDeleteProtectionBranch,
  reportPrivateRepoRemoved,
  validateChangesFolderConfig,
  validateChangesPushUser
} from "../controllers/index.js";
import { githubPingHandler } from "../middlewares/githubEventHandler.js";
import { validateJsonMiddleware, verifyGitHubIP } from "../middlewares/index.js";

const router = Router();

router.use(verifyGitHubIP);

router.use(validateJsonMiddleware);

router.use(githubPingHandler);

router.post("/generate-pull-request", changesGeneratePullRequest);
router.post("/validate-changes-folder", validateChangesFolderConfig);
router.post("/validate-changes-push-user", validateChangesPushUser);
router.post("/delete-important-branch", reportDeleteImportantBranch);
router.post("/delete-protection-branch", reportDeleteProtectionBranch);
router.post("/repository-removed", reportPrivateRepoRemoved);

export default router;