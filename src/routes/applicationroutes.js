import express from 'express';
import { applyForJob, toggleSaveJob, getMyAppliactions, getSavedJobs } from '../controllers/applicationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Job application and saved jobs management
 */

/**
 * @swagger
 * /applications/apply:
 *   post:
 *     summary: Apply for a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: ID of the job to apply for
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succeeded:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Application submitted successfully!
 *       400:
 *         description: Already applied to this job
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succeeded:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Already applied.
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       404:
 *         description: Job unavailable, profile not found, or resume not uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succeeded:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Profile or Resume not available
 *       500:
 *         description: Server Error
 */
router.post('/apply', authenticate, applyForJob);

/**
 * @swagger
 * /applications/history:
 *   get:
 *     summary: Get user's application history
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succeeded:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       job:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           companyName:
 *                             type: string
 *                           location:
 *                             type: string
 *                           status:
 *                             type: string
 *                       applicationStatus:
 *                         type: string
 *                         example: Pending
 *                       resumeUrl:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       rejectionReason:
 *                         type: string
 *                         description: Present only if application was rejected
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       500:
 *         description: Server Error
 */
router.get('/history', authenticate, getMyAppliactions);

/**
 * @swagger
 * /applications/save:
 *   post:
 *     summary: Save or unsave a job (toggle)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: ID of the job to save/unsave
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Job removed from saved list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succeeded:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Job Removed From Saved List.
 *       201:
 *         description: Job saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succeeded:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Job Saved Successfully.
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       500:
 *         description: Server Error
 */
router.post('/save', authenticate, toggleSaveJob);

/**
 * @swagger
 * /applications/saved:
 *   get:
 *     summary: Get user's saved jobs
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saved jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succeeded:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: SavedJob document ID
 *                       user:
 *                         type: string
 *                       job:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           companyName:
 *                             type: string
 *                           location:
 *                             type: string
 *                           jobType:
 *                             type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: When the job was saved
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       500:
 *         description: Server Error
 */
router.get('/saved', authenticate, getSavedJobs);

export default router;