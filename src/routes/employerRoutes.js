import express from 'express';
import {getEmployerStats, getCompanyProfile, updateCompanyProfile} from '../controllers/employerController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/profile', authenticate, updateCompanyProfile);
router.get('/profile', authenticate, getCompanyProfile);
router.get('/stats', authenticate, getEmployerStats);

export default router;