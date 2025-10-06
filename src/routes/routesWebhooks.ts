import { Router } from "express";
import { json } from "express";
import { verifySignature } from "../middlewares/index.js";
import {
  changesGeneratePullRequest,
  reportDeleteImportantBranch,
  reportDeleteProtectionBranch,
  reportPrivateRepoRemoved,
  testSendToPowerAutomate,
  validateChangesFolderConfig,
  validateChangesPushUser
} from "../controllers/index.js";
import { githubPingHandler } from "../middlewares/githubEventHandler.js";

const router = Router();

router.use(json({ verify: verifySignature }));

router.use(githubPingHandler);

router.post("/generate-pull-request", changesGeneratePullRequest);
router.get("/test", testSendToPowerAutomate);
router.post("/validate-changes-folder", validateChangesFolderConfig);
router.post("/validate-changes-push-user", validateChangesPushUser);
router.post("/delete-important-branch", reportDeleteImportantBranch);
router.post("/delete-protection-branch", reportDeleteProtectionBranch);
router.post("/repository-removed", reportPrivateRepoRemoved);

export default router;