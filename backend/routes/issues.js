const router = require('express').Router();
const { query, body, validationResult } = require('express-validator');
const multer = require("multer");
const mongoose = require('mongoose');
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
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const priorityFilter = req.query.priority !== '' && typeof req.query.priority !== 'undefined' ? { priority: req.query.priority } : {};
            const statusFilter = req.query.status !== '' && typeof req.query.status !== 'undefined' ? { status: req.query.status } : {};
            const categoryFilter = req.query.category !== '' && typeof req.query.category !== 'undefined' ? { category: req.query.category } : {};
            const addressFilter = req.query.location !== '' && typeof req.query.location !== 'undefined' ? { address: req.query.location } : {};
            const filterParams = {
                $and: [
                    statusFilter,
                    priorityFilter,
                    categoryFilter,
                    addressFilter
                ],
            };

            // Fetch issues, projecting upvote count
            const issues = await Issue.aggregate([
                { $match: filterParams },
                {
                    $addFields: {
                        upvoteCount: { $size: { $ifNull: ['$upvotes', []] } }
                    }
                },
                { $sort: { createdAt: -1 } },
                {
                    $project: {
                        __v: 0 // Exclude the version key
                    }
                }
            ]);

            return res.status(200).json(issues);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while fetching issues.' });
        }
    }
);

/**
 * @swagger
 * /api/issues/myissues:
 *   get:
 *     summary: Get issues created by the authenticated user
 *     description: Retrieves issues created by the currently logged-in user with optional filters for priority, status, and category.
 *     tags:
 *       - Issues
 *     parameters:
 *       - name: priority
 *         in: query
 *         description: Filter issues by priority
 *         required: false
 *         schema:
 *           type: string
 *           example: Critical
 *       - name: status
 *         in: query
 *         description: Filter issues by status
 *         required: false
 *         schema:
 *           type: string
 *           example: Pending
 *       - name: category
 *         in: query
 *         description: Filter issues by category
 *         required: false
 *         schema:
 *           type: string
 *           example: electricity
 *     responses:
 *       200:
 *         description: List of issues created by the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "641db345d1e4a4b7dc123abc"
 *                   description:
 *                     type: string
 *                     example: "Issue about server downtime"
 *                   photoUrl:
 *                     type: string
 *                     example: "http://example.com/photo.jpg"
 *                   audioUrl:
 *                     type: string
 *                     example: "http://example.com/audio.mp3"
 *                   address:
 *                     type: string
 *                     example: "123 Main St"
 *                   priority:
 *                     type: string
 *                     example: "Critical"
 *                   status:
 *                     type: string
 *                     example: "Pending"
 *                   upvotes:
 *                     type: array
 *                     items:
 *                       type: string
 *                       example: "642334c23dc234abcd2134"
 *                   upvoteCount:
 *                     type: number
 *                     example: 1
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-12-01T12:00:00Z"
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.get(
    '/myissues',
    verifyToken(['Admin', 'Authority', 'Citizen']), // Ensure user is authenticated
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const priorityFilter = req.query.priority !== '' && typeof req.query.priority !== 'undefined' ? { priority: req.query.priority } : {};
            const statusFilter = req.query.status !== '' && typeof req.query.status !== 'undefined' ? { status: req.query.status } : {};
            const categoryFilter = req.query.category !== '' && typeof req.query.category !== 'undefined' ? { category: req.query.category } : {};

            const filterParams = {
                $and: [
                    { createdBy: req.user._id }, // Only fetch issues created by the logged-in user
                    statusFilter,
                    priorityFilter,
                    categoryFilter,
                ],
            };

            // Fetch issues, projecting upvote count
            const issues = await Issue.aggregate([
                { $match: filterParams },
                {
                    $addFields: {
                        upvoteCount: { $size: { $ifNull: ['$upvotes', []] } }
                    }
                },
                { $sort: { createdAt: -1 } },
                {
                    $project: {
                        __v: 0 // Exclude the version key
                    }
                }
            ]);

            return res.status(200).json(issues);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while fetching issues.' });
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
        body('address').notEmpty().withMessage('Address is required.')
    ],
    verifyToken(['Citizen']),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { description, address } = req.body;
            const photoUrl = req.files.photo ? process.env.SERVER_URL + '/' + req.files.photo[0].path.replace(/\\/g, '/').replace('public/', '') : null;
            const audioUrl = req.files.audio ? process.env.SERVER_URL + '/' + req.files.audio[0].path.replace(/\\/g, '/').replace('public/', '') : null;

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
                createdBy: req.user._id
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

/**
 * @swagger
 * /api/issues/getOneIssue/{id}:
 *   get:
 *     summary: Retrieve a single issue by its ID
 *     description: Fetch a specific issue, including its details, by providing the issue ID.
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the issue to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved the issue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                   example: "Broken streetlight"
 *                 photoUrl:
 *                   type: string
 *                   example: "http://example.com/photo.jpg"
 *                 audioUrl:
 *                   type: string
 *                   example: "http://example.com/audio.mp3"
 *                 address:
 *                   type: string
 *                   example: "123 Main St"
 *                 priority:
 *                   type: string
 *                   enum: [Critical, Moderate, Low]
 *                   example: "Moderate"
 *                 status:
 *                   type: string
 *                   enum: [Pending, In Progress, Resolved]
 *                   example: "Pending"
 *                 createdBy:
 *                   type: string
 *                   example: "60dfb81f12e3f504d8b1e3a9"
 *                 upvotes:
 *                   type: number
 *                   example: 15
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["60dfb81f12e3f504d8b1e3b0", "60dfb81f12e3f504d8b1e3b1"]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-12-14T09:25:22.497Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-12-14T09:25:22.497Z"
 *       400:
 *         description: Malformed issue ID or issue not found
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.get('/getOneIssue/:id', verifyToken(['Admin', 'Authority', 'Citizen']), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Malformed issue id');
    }

    const issue = await Issue.findById(req.params.id).select('-__v');
    if (!issue) {
        return res.status(400).send('issue not found');
    }

    return res.send(issue);
});

/**
 * @swagger
 * /api/upvote/{id}:
 *   put:
 *     summary: Upvote an issue
 *     description: Allows a user to upvote an issue. Each user can only upvote an issue once.
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the issue to upvote
 *     responses:
 *       200:
 *         description: Successfully upvoted the issue
 *       400:
 *         description: User has already upvoted this issue or malformed issue ID
 *       404:
 *         description: Issue not found
 *       500:
 *         description: Internal server error
 */
router.put('/upvote/:id', verifyToken(['Admin', 'Authority', 'Citizen']), async (req, res) => {
    const issueId = req.params.id;
    const userId = req.user._id; // Assuming req.user contains the authenticated user's data

    if (!mongoose.isValidObjectId(issueId)) {
        return res.status(400).send({ message: 'Malformed issue ID' });
    }

    try {
        const issue = await Issue.findById(issueId);

        if (!issue) {
            return res.status(404).send({ message: 'Issue not found' });
        }

        // Check if the user is trying to upvote their own issue
        if (issue.createdBy.toString() === userId.toString()) {
            return res.status(400).send({ message: 'You cannot upvote your own issue' });
        }

        if (issue.upvotes.includes(userId)) {
            return res.status(400).send({ message: 'You have already upvoted this issue' });
        }

        issue.upvotes.push(userId);
        await issue.save();

        return res.status(200).send({ message: 'Issue successfully upvoted' });
    } catch (error) {
        return res.status(500).send({ message: 'Server error occurred while upvoting the issue', error: error.message });
    }
});

module.exports = router;