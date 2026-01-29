import express from 'express';
import { createJob, getAllJobs, getJobById} from '../controllers/jobController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllJobs);
router.get('/:id', getJobById);

router.post('/', authenticate, createJob)
export default router;