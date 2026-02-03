import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { uploadResume } from '../controllers/jobSeekerController.js';
import { getProfile, updateProfile } from '../controllers/jobSeekerController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: JobSeeker
 *   description: Job seeker profile management
 */

/**
 * @swagger
 * /jobseeker/upload-resume:
 *   post:
 *     summary: Upload resume file
 *     tags: [JobSeeker]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resume
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Resume file (PDF, DOC, DOCX)
 *     responses:
 *       200:
 *         description: Resume uploaded successfully
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
 *                   example: Resume uploaded successfully.
 *                 data:
 *                   type: string
 *                   description: URL of the uploaded resume
 *                   example: https://res.cloudinary.com/resumeefy/resume.pdf
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       500:
 *         description: Server Error
 */
router.post('/upload-resume', authenticate, upload.single('resume'), uploadResume);

/**
 * @swagger
 * /jobseeker/profile:
 *   get:
 *     summary: Get job seeker profile
 *     tags: [JobSeeker]
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
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         email:
 *                           type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     city:
 *                       type: string
 *                     country:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     headline:
 *                       type: string
 *                     portfolioUrl:
 *                       type: string
 *                     linkedinUrl:
 *                       type: string
 *                     githubUrl:
 *                       type: string
 *                     resumeUrl:
 *                       type: string
 *                     workExperience:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           jobTitle:
 *                             type: string
 *                           company:
 *                             type: string
 *                           startDate:
 *                             type: string
 *                             format: date
 *                           endDate:
 *                             type: string
 *                             format: date
 *                           description:
 *                             type: string
 *                     education:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           school:
 *                             type: string
 *                           degree:
 *                             type: string
 *                           fieldOfStudy:
 *                             type: string
 *                           startDate:
 *                             type: string
 *                             format: date
 *                           endDate:
 *                             type: string
 *                             format: date
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server Error
 */
router.get('/profile', authenticate, getProfile);

/**
 * @swagger
 * /jobseeker/profile:
 *   put:
 *     summary: Update job seeker profile
 *     tags: [JobSeeker]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               city:
 *                 type: string
 *                 example: New York
 *               country:
 *                 type: string
 *                 example: USA
 *               bio:
 *                 type: string
 *                 example: Experienced software developer with 5+ years in full-stack development
 *               headline:
 *                 type: string
 *                 example: Full-Stack Developer | React & Node.js Expert
 *               portfolioUrl:
 *                 type: string
 *                 example: https://johndoe.dev
 *               linkedinUrl:
 *                 type: string
 *                 example: https://linkedin.com/in/johndoe
 *               githubUrl:
 *                 type: string
 *                 example: https://github.com/johndoe
 *               workExperience:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     jobTitle:
 *                       type: string
 *                       example: Senior Software Engineer
 *                     company:
 *                       type: string
 *                       example: Tech Corp
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       example: 2020-01-01
 *                     endDate:
 *                       type: string
 *                       format: date
 *                       example: 2023-12-31
 *                     description:
 *                       type: string
 *                       example: Led development of microservices architecture
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     school:
 *                       type: string
 *                       example: MIT
 *                     degree:
 *                       type: string
 *                       example: Bachelor of Science
 *                     fieldOfStudy:
 *                       type: string
 *                       example: Computer Science
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       example: 2015-09-01
 *                     endDate:
 *                       type: string
 *                       format: date
 *                       example: 2019-05-01
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [JavaScript, React, Node.js, MongoDB, Docker]
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
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully.
 *                 data:
 *                   type: object
 *                   description: Updated profile object
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       500:
 *         description: Server Error
 */
router.put('/profile', authenticate, updateProfile);

export default router;