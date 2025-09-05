const router = require('express').Router();
const { query, body, validationResult } = require('express-validator');
const multer = require("multer");
const Issue = require('../models/Issue');
const { classifyIssue } = require('../utils/utils');
const verifyToken = require('../utils/verifyToken');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'audio/mpeg', 'audio/wav'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, MP3, and WAV are allowed.'));
        }
    }
});

/**
 * @swagger
 * /api/issues:
 *   get:
 *     summary: Retrieve a list of issues
 *     tags:
 *       - Issues
 *     parameters:
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Critical, Moderate, Low]
 *         description: Filter issues by priority
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, In Progress, Resolved]
 *         description: Filter issues by status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter issues by category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of issues per page
 *     responses:
 *       200:
 *         description: A list of issues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issues:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       description:
 *                         type: string
 *                       photoUrl:
 *                         type: string
 *                       audioUrl:
 *                         type: string
 *                       address:
 *                         type: string
 *                       priority:
 *                         type: string
 *                         enum: [Critical, Moderate, Low]
 *                       status:
 *                         type: string
 *                         enum: [Pending, In Progress, Resolved]
 *                       createdBy:
 *                         type: string
 *                       upvotes:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Validation errors
 *       500:
 *         description: Server error
 */
router.get(
    '/',
    [
        query('priority').optional().isIn(['Critical', 'Moderate', 'Low']),
        query('status').optional().isIn(['Pending', 'In Progress', 'Resolved']),
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { priority, status, category, page = 1, limit = 10 } = req.query;

            const filters = {};
            if (priority) filters.priority = priority;
            if (status) filters.status = status;
            if (category) filters.category = category;

            const skip = (page - 1) * limit;

            const issues = await Issue.find(filters)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const totalIssues = await Issue.countDocuments(filters);

            res.status(200).json({
                issues,
                totalPages: Math.ceil(totalIssues / limit),
                currentPage: page
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'An error occurred while fetching issues.' });
        }
    }
);

/**
 * @swagger
 * /api/issues/create:
 *   post:
 *     summary: Submit a new issue
 *     tags:
 *       - Issues
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: A brief description of the issue.
 *               address:
 *                 type: string
 *                 description: The location of the issue.
 *               createdBy:
 *                 type: string
 *                 description: The user ID of the creator.
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Photo of the issue.
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Audio recording describing the issue.
 *     responses:
 *       201:
 *         description: Issue submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message.
 *                 issue:
 *                   type: object
 *                   description: The created issue object.
 *                 classification:
 *                   type: object
 *                   description: AI classification details.
 *       400:
 *         description: Validation error or insufficient input.
 *       500:
 *         description: Server error.
 */
router.post(
    '/create',
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'audio', maxCount: 1 }
    ]),
    [
        body('description').optional().isString().withMessage('Description must be a string.'),
        body('address').notEmpty().withMessage('Address is required.'),
        body('createdBy').notEmpty().withMessage('User ID is required.')
    ],
    verifyToken(['Citizen']),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { description, address, createdBy } = req.body;
            const photoUrl = req.files.photo ? req.files.photo[0].path : null;
            const audioUrl = req.files.audio ? req.files.audio[0].path : null;

            // Ensure at least one input is provided
            if (!description && !photoUrl && !audioUrl) {
                return res.status(400).json({
                    error: 'At least one of description, photo, or audio is required.'
                });
            }

            // AI processing for classification and priority
            const classification = await classifyIssue(description || '', address);

            const newIssue = new Issue({
                description,
                photoUrl,
                audioUrl,
                address,
                priority: classification.priority || 'Moderate',
                createdBy
            });

            const savedIssue = await newIssue.save();

            delete savedIssue._doc.__v;

            res.status(201).json({
                message: 'Issue submitted successfully.',
                issue: savedIssue,
                classification
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'An error occurred while submitting the issue.' });
        }
    }
);


module.exports = router;