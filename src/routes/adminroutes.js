import express from 'express';
import { getSystemStats , toggleUserBan, getAllUsers, getJobsForModeration , moderateJob, createModerator, getAuditLogs} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin , requireSuperAdmin} from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(authenticate, requireAdmin);
router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.patch('/users/:userId/ban', requireSuperAdmin, toggleUserBan);
router.get('/jobs', getJobsForModeration);    
router.patch('/jobs/:jobId/moderate', moderateJob);
router.post('/moderators', requireSuperAdmin, createModerator);
router.get('/logs', requireSuperAdmin, getAuditLogs);
export default router;