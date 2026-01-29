import express from 'express';
import {applyForJob, toggleSaveJob, getMyAppliactions, getSavedJobs} from '../controllers/applicationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/apply', authenticate, applyForJob);
router.get('/history', authenticate, getMyAppliactions);

router.post('/save', authenticate, toggleSaveJob);
router.get('/saved', authenticate, getSavedJobs);

export default router;