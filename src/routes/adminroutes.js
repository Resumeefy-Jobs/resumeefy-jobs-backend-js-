import express from 'express';
import { getSystemStats , toggleUserBan, getAllUsers} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin , requireSuperAdmin} from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(authenticate, requireAdmin);
router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.patch('/users/:userId/ban', requireSuperAdmin, toggleUserBan);
export default router;