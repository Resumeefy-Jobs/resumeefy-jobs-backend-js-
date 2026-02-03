import express from 'express';
import { getEmployerStats, getCompanyProfile, updateCompanyProfile, getJobApplicants, updateApplicationStatus } from '../controllers/employerController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Employer
 *   description: Employer and company profile management
 */

/**
 * @swagger
 * /employer/profile:
 *   put:
 *     summary: Update company profile
 *     tags: [Employer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: Tech Corp Inc
 *               website:
 *                 type: string
 *                 example: https://techcorp.com
 *               location:
 *                 type: string
 *                 example: San Francisco, CA
 *               industry:
 *                 type: string
 *                 example: Technology
 *               description:
 *                 type: string
 *                 example: Leading technology company specializing in AI solutions
 *               size:
 *                 type: string
 *                 example: 100-500
 *               logoUrl:
 *                 type: string
 *                 example: https://res.cloudinary.com/company/logo.png
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succeeded:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Updated company profile
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       500:
 *         description: Server Error
 */
router.put('/profile', authenticate, updateCompanyProfile);

/**
 * @swagger
 * /employer/profile:
 *   get:
 *     summary: Get company profile
 *     tags: [Employer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succeeded:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     user:
 *                       type: string
 *                     companyName:
 *                       type: string
 *                     website:
 *                       type: string
 *                     location:
 *                       type: string
 *                     industry:
 *                       type: string
 *                     description:
 *                       type: string
 *                     size:
 *                       type: string
 *                     logoUrl:
 *                       type: string
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       404:
 *         description: Company Profile Not Found
 *       500:
 *         description: Server Error
 */
router.get('/profile', authenticate, getCompanyProfile);

/**
 * @swagger
 * /employer/stats:
 *   get:
 *     summary: Get employer statistics
 *     tags: [Employer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succeeded:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalJobs:
 *                       type: integer
 *                       description: Total number of jobs posted by employer
 *                       example: 15
 *                     activeJobs:
 *                       type: integer
 *                       description: Number of currently active jobs
 *                       example: 8
 *                     totalApplications:
 *                       type: integer
 *                       description: Total applications received across all jobs
 *                       example: 247
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       500:
 *         description: Server Error
 */
router.get('/stats', authenticate, getEmployerStats);

/**
 * @swagger
 * /employer/jobs/{jobId}/applicants:
 *   get:
 *     summary: Get all applicants for a specific job
 *     tags: [Employer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Applicants retrieved successfully
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
 *                       applicationId:
 *                         type: string
 *                       status:
 *                         type: string
 *                         example: Pending
 *                       appliedAt:
 *                         type: string
 *                         format: date-time
 *                       applicantName:
 *                         type: string
 *                         description: Full name or "Candidate #XXXX" if blind mode
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         description: Email or "HIDDEN" if blind mode
 *                         example: john@example.com
 *                       phone:
 *                         type: string
 *                         description: Phone or "HIDDEN" if blind mode
 *                         example: +1234567890
 *                       headline:
 *                         type: string
 *                         description: Only shown if not blind mode
 *                         example: Senior Software Engineer
 *                       location:
 *                         type: string
 *                         description: Only shown if not blind mode
 *                         example: New York, USA
 *                       skills:
 *                         type: array
 *                         items:
 *                           type: string
 *                       workExperience:
 *                         type: array
 *                         items:
 *                           type: object
 *                       education:
 *                         type: array
 *                         items:
 *                           type: object
 *                       resumeUrl:
 *                         type: string
 *                       links:
 *                         type: object
 *                         properties:
 *                           linkedin:
 *                             type: string
 *                             description: LinkedIn URL or "HIDDEN" if blind mode
 *                           portfolio:
 *                             type: string
 *                             description: Portfolio URL or "HIDDEN" if blind mode
 *                           github:
 *                             type: string
 *                             description: GitHub URL or "HIDDEN" if blind mode
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       404:
 *         description: Job not found or unauthorized
 *       500:
 *         description: Server Error
 */
router.get('/jobs/:jobId/applicants', authenticate, getJobApplicants);

/**
 * @swagger
 * /employer/applications/{applicationId}/status:
 *   patch:
 *     summary: Update application status
 *     tags: [Employer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Shortlisted, Interview, Rejected, Accepted]
 *                 example: Shortlisted
 *               rejectionReason:
 *                 type: string
 *                 description: Required when status is "Rejected"
 *                 example: Position has been filled
 *     responses:
 *       200:
 *         description: Application status updated successfully
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
 *                   example: Application status updated to Shortlisted.
 *       400:
 *         description: Rejection Reason Is Mandatory. Pls provide Feedback
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       403:
 *         description: Unauthorized action - Not the job owner
 *       404:
 *         description: Job Application not Found
 *       500:
 *         description: Server Error
 */
router.patch('/applications/:applicationId/status', authenticate, updateApplicationStatus);

export default router;