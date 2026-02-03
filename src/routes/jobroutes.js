import express from 'express';
import { createJob, getAllJobs, getJobById } from '../controllers/jobController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job posting and search management
 */

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all jobs with filtering and pagination
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword for full-text search
 *         example: software engineer
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location (case-insensitive partial match)
 *         example: New York
 *       - in: query
 *         name: jobType
 *         schema:
 *           type: string
 *         description: Filter by job type
 *         example: Full-time
 *       - in: query
 *         name: workMode
 *         schema:
 *           type: string
 *         description: Filter by work mode
 *         example: Remote
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of jobs per page
 *         example: 10
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
 *                       location:
 *                         type: string
 *                       jobType:
 *                         type: string
 *                       workMode:
 *                         type: string
 *                       salary:
 *                         type: object
 *                       employer:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                       isActive:
 *                         type: boolean
 *                       moderationStatus:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalJobs:
 *                       type: integer
 *                       example: 45
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *       500:
 *         description: Server Error
 */
router.get('/', getAllJobs);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Job retrieved successfully
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
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     location:
 *                       type: string
 *                     jobType:
 *                       type: string
 *                     workMode:
 *                       type: string
 *                     salary:
 *                       type: object
 *                     requirements:
 *                       type: array
 *                       items:
 *                         type: string
 *                     responsibilities:
 *                       type: array
 *                       items:
 *                         type: string
 *                     employer:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *                     isActive:
 *                       type: boolean
 *                     moderationStatus:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server Error
 */
router.get('/:id', getJobById);

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create a new job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - location
 *               - jobType
 *               - workMode
 *             properties:
 *               title:
 *                 type: string
 *                 example: Senior Full-Stack Developer
 *               description:
 *                 type: string
 *                 example: We are looking for an experienced full-stack developer to join our team
 *               location:
 *                 type: string
 *                 example: San Francisco, CA
 *               jobType:
 *                 type: string
 *                 enum: [Full-time, Part-time, Contract, Internship]
 *                 example: Full-time
 *               workMode:
 *                 type: string
 *                 enum: [Remote, Hybrid, On-site]
 *                 example: Remote
 *               salary:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                     example: 100000
 *                   max:
 *                     type: number
 *                     example: 150000
 *                   currency:
 *                     type: string
 *                     example: USD
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [5+ years experience, React, Node.js, MongoDB]
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [Develop new features, Code review, Mentor junior developers]
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [Health insurance, 401k, Flexible hours]
 *               applicationDeadline:
 *                 type: string
 *                 format: date
 *                 example: 2024-12-31
 *     responses:
 *       201:
 *         description: Job posted successfully
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
 *                   example: Job Posted Successfully
 *                 data:
 *                   type: object
 *                   description: Created job object with employer ID
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       500:
 *         description: Server Error
 */
router.post('/', authenticate, createJob);

export default router;