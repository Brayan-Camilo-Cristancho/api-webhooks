import { Router } from "express";
import { json } from "express";
import { verifySignature } from "../middlewares/index.js";
import { 
  changesGeneratePullRequest,
  reportBypassPushRuleset,
  reportDeleteImportantBranch,
  reportDeleteProtectionBranch,
  reportMembershipChange,
  reportPersonalAccessTokenRequest,
  reportPrivateRepoRemoved,
  validateChangesFolderConfig,
  validateChangesPushUser,
  validateForcePush
} from "../controllers/index.js";
import { githubPingHandler } from "../middlewares/githubEventHandler.js";

const router = Router();

router.use(json({ verify: verifySignature }));

router.use(githubPingHandler);

router.post("/generate-pull-request", changesGeneratePullRequest);
router.post("/validate-changes-folder", validateChangesFolderConfig);
router.post("/validate-changes-push-user", validateChangesPushUser);
router.post("/validate-force-push", validateForcePush);
router.post("/delete-important-branch", reportDeleteImportantBranch);
router.post("/delete-protection-branch", reportDeleteProtectionBranch);
router.post("/membership-change", reportMembershipChange);
router.post("/repository-removed", reportPrivateRepoRemoved);
router.post("/personal-access-token-request", reportPersonalAccessTokenRequest);

export default router;
