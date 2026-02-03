import express from 'express';
import { getSystemStats, toggleUserBan, getAllUsers, getJobsForModeration, moderateJob, createModerator, getAuditLogs } from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative functions (requires Admin role)
 */

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get system-wide statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
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
 *                     totalUsers:
 *                       type: integer
 *                       example: 1523
 *                     totalJobs:
 *                       type: integer
 *                       example: 456
 *                     totalApplications:
 *                       type: integer
 *                       example: 8932
 *                     breakdown:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: object
 *                           properties:
 *                             JobSeeker:
 *                               type: integer
 *                               example: 1200
 *                             Employer:
 *                               type: integer
 *                               example: 300
 *                             Admin:
 *                               type: integer
 *                               example: 23
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server Error
 */
router.get('/stats', getSystemStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users with pagination
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       isBanned:
 *                         type: boolean
 *                       isEmailVerified:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 1523
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pages:
 *                       type: integer
 *                       example: 153
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server Error
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /admin/users/{userId}/ban:
 *   patch:
 *     summary: Ban or unban a user (toggle) - SuperAdmin only
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to ban/unban
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: User ban status toggled successfully
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
 *                   example: User marked as Banned.
 *       400:
 *         description: Cannot ban yourself
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not a SuperAdmin
 *       404:
 *         description: User not found
 *       500:
 *         description: Server Error
 */
router.patch('/users/:userId/ban', requireSuperAdmin, toggleUserBan);

/**
 * @swagger
 * /admin/jobs:
 *   get:
 *     summary: Get jobs for moderation with filtering
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *         description: Filter by moderation status
 *         example: Pending
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of jobs per page
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
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
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       moderationStatus:
 *                         type: string
 *                         enum: [Pending, Approved, Rejected]
 *                       employer:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           companyName:
 *                             type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server Error
 */
router.get('/jobs', getJobsForModeration);

/**
 * @swagger
 * /admin/jobs/{jobId}/moderate:
 *   patch:
 *     summary: Approve or reject a job posting
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID to moderate
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [Approve, Reject]
 *                 example: Approve
 *     responses:
 *       200:
 *         description: Job moderated successfully
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
 *                   example: Job Approved Successfully.
 *       400:
 *         description: Invalid action
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Job Not Found
 *       500:
 *         description: Server Error
 */
router.patch('/jobs/:jobId/moderate', moderateJob);

/**
 * @swagger
 * /admin/moderators:
 *   post:
 *     summary: Create a new moderator account - SuperAdmin only
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: moderator@resumeefy.com
 *     responses:
 *       201:
 *         description: Moderator created successfully
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
 *                   example: Moderator John created. Credentials sent to email.
 *       400:
 *         description: User with email already exists
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not a SuperAdmin
 *       500:
 *         description: Server Error
 */
router.post('/moderators', requireSuperAdmin, createModerator);

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: Get audit logs (last 50 actions) - SuperAdmin only
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
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
 *                       admin:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                       action:
 *                         type: string
 *                         enum: [BAN_USER, UNBAN_USER, APPROVE_JOB, REJECT_JOB, CREATE_MODERATOR]
 *                         example: APPROVE_JOB
 *                       targetId:
 *                         type: string
 *                       targetModel:
 *                         type: string
 *                         example: Job
 *                       details:
 *                         type: string
 *                         example: Job Approved
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not a SuperAdmin
 *       500:
 *         description: Server Error
 */
router.get('/logs', requireSuperAdmin, getAuditLogs);

export default router;