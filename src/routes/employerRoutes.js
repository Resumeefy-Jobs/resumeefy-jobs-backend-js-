import express from 'express';
import {getEmployerStats, getCompanyProfile, updateCompanyProfile, getJobApplicants, updateApplicationStatus} from '../controllers/employerController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/profile', authenticate, updateCompanyProfile);
router.get('/profile', authenticate, getCompanyProfile);
router.get('/stats', authenticate, getEmployerStats);
router.get('/jobs/:jobId/applicants', authenticate, getJobApplicants);
router.patch('/applications/:applicationId/status', authenticate, updateApplicationStatus);
export default router;