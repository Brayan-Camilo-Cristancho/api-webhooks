import { Router } from 'express';
import { json } from 'express';
import { verifySignature } from '../middlewares/index.js';
import { changesGeneratePullRequest, reportBypassPushRuleset, reportDeleteImportantBranch, reportDeleteProtectionBranch, reportMembershipChange, reportPersonalAccessTokenRequest, reportPrivateRepoRemoved, validateChangesFolderConfig, validateChangesPushUser, validateForcePush, validateMonitorPushUser } from '../controllers/index.js';

const router = Router();

router.post('/generate-pull-request', json({ verify: verifySignature }), changesGeneratePullRequest);
router.post('/validate-changes-folder', json({ verify: verifySignature }), validateChangesFolderConfig);
router.post('/validate-changes-push-user', json({ verify: verifySignature }), validateChangesPushUser);
router.post('/validate-force-push', json({ verify: verifySignature }), validateForcePush);
router.post('/delete-important-branch', json({ verify: verifySignature }), reportDeleteImportantBranch);
router.post('/delete-protection-branch', json({ verify: verifySignature }), reportDeleteProtectionBranch);
router.post('/bypass-push-ruleset', json({ verify: verifySignature }), reportBypassPushRuleset);
router.post('/membership-change', json({ verify: verifySignature }), reportMembershipChange);
router.post('/repository-removed', json({ verify: verifySignature }), reportPrivateRepoRemoved);
router.post('/personal-access-token-request', json({ verify: verifySignature }), reportPersonalAccessTokenRequest);
router.post('/monitorUserPushChanges', json({ verify: verifySignature }), validateMonitorPushUser);

export default router;
