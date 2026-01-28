import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {uploadResume} from '../controllers/jobSeekerController.js';
import {getProfile, updateProfile} from '../controllers/jobSeekerController.js';

const router = express.Router();
router.post('/upload-resume', authenticate, upload.single('resume'), uploadResume);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;