const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const multer = require("multer");
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const verifyToken = require('../utils/verifyToken');
const { classifyIssue } = require('../utils/openaiClient');
const { OpenAI } = require('openai');

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/issues/');
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
    verifyToken(['Admin', 'Citizen', 'Authority']),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const priorityFilter = req.query.priority ? { priority: req.query.priority } : {};
            const statusFilter = req.query.status ? { status: req.query.status } : {};
            const categoryFilter = req.query.category ? { category: req.query.category } : {};
            const addressFilter = req.query.location ? { address: { $regex: req.query.location, $options: 'i' } } : {};

            let userFilter = {};

            if (req.user.role === 'Authority') {
                // Fetch all citizens linked to this authority
                const citizens = await User.find({ authority: req.user._id }).select('_id');

                // Ensure issues are only from the authority’s citizens
                userFilter = { createdBy: { $in: citizens.map(citizen => citizen._id) } };
            }

            const filterParams = {
                $and: [
                    statusFilter,
                    priorityFilter,
                    categoryFilter,
                    addressFilter,
                    userFilter
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

router.get(
    '/explore-issues',
    async (req, res) => {
        try {
            const { page = 1, limit = 10, priority, status, category, location } = req.query;

            // Parse page and limit as numbers
            const pageNumber = parseInt(page, 10) || 1;
            const limitNumber = parseInt(limit, 10) || 10;

            // Build filters
            const priorityFilter = priority ? { priority } : {};
            const statusFilter = status ? { status } : {};
            const categoryFilter = category ? { category } : {};
            const addressFilter = location ? { address: { $regex: location, $options: 'i' } } : {};

            const filterParams = {
                $and: [statusFilter, priorityFilter, categoryFilter, addressFilter],
            };

            // Calculate total count for pagination
            const totalCount = await Issue.countDocuments(filterParams);

            // Fetch paginated issues
            const issues = await Issue.aggregate([
                { $match: filterParams },
                {
                    $addFields: {
                        upvoteCount: { $size: { $ifNull: ['$upvotes', []] } },
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (pageNumber - 1) * limitNumber },
                { $limit: limitNumber },
                {
                    $project: {
                        __v: 0, // Exclude the version key
                    },
                },
            ]);

            // Calculate total pages
            const totalPages = Math.ceil(totalCount / limitNumber);

            return res.status(200).json({
                data: issues,
                totalPages,
                currentPage: pageNumber,
                totalCount,
            });
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
            const priorityFilter = req.query.priority
                ? { priority: req.query.priority }
                : {};
            const statusFilter = req.query.status
                ? { status: req.query.status }
                : {};
            const addressFilter = req.query.address
                ? { address: { $regex: req.query.address, $options: 'i' } }
                : {};

            const filterParams = {
                $and: [
                    { createdBy: new mongoose.Types.ObjectId(req.user._id) },
                    priorityFilter,
                    statusFilter,
                    addressFilter,
                ],
            };

            // Fetch issues, projecting upvote count
            const issues = await Issue.aggregate([
                { $match: filterParams },
                {
                    $addFields: {
                        upvoteCount: { $size: { $ifNull: ['$upvotes', []] } },
                    },
                },
                { $sort: { createdAt: -1 } },
                {
                    $project: {
                        __v: 0, // Exclude the version key
                    },
                },
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
            const { description, address, category, priority } = req.body;

            const photoFile = req.files.photo ? req.files.photo[0] : null;
            const audioFile = req.files.audio ? req.files.audio[0] : null;

            const photoUrl = photoFile
            ? '/' + photoFile.path.replace(/\\/g, '/').replace(/^public\//, '')
            : null;

            const audioUrl = audioFile
            ? '/' + audioFile.path.replace(/\\/g, '/').replace(/^public\//, '')
            : null;

            // Ensure at least one input is provided
            if (!description && !photoUrl && !audioUrl) {
                return res.status(400).json({
                    error: 'At least one of description, photo, or audio is required.'
                });
            }


            const newIssue = new Issue({
                description: description,
                transcription: description,
                photoUrl,
                audioUrl,
                address,
                category,
                priority,
                createdBy: req.user._id
            });

            const savedIssue = await newIssue.save();

            delete savedIssue._doc.__v;

            res.status(201).json({
                message: 'Issue submitted successfully.',
                issue: savedIssue
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'An error occurred while submitting the issue.' });
        }
    }
);

router.post('/generate-ai', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), async (req, res) => {
    try {
        const { description } = req.body;
        const photo = req.files.photo ? req.files.photo[0] : null;
        const audio = req.files.audio ? req.files.audio[0] : null;

        let contentToProcess = description || '';  // Default to the description if provided

        // Process audio if it's provided
        if (audio) {
            const audioFile = fs.createReadStream(audio.path);
            const transcriptionResponse = await client.audio.transcriptions.create({
                file: audioFile,
                model: "whisper-1",
                language: "en",
            });
            contentToProcess = transcriptionResponse.text.trim();
        }

        if (photo) {
            // Mock description for the photo (replace with actual photo analysis logic)
            contentToProcess += ' The image provided contains some important details related to the issue.';
        }

        const messages = [
            {
                role: 'system',
                content: 'You are an assistant that classifies urban issues and assigns priority levels. Respond ONLY with valid minified JSON and NO other text. You are JSON API',
            },
            {
                role: 'user',
                content: `
                    Based on the following information, provide a detailed description and assign a priority level:
                    Priority levels are Critical, Moderate, and Low.
                    Information: "${contentToProcess}"
                    Respond in JSON format:
                    {
                      "description": "<Detailed Description>",
                      "priority": "<Priority>"
                    }
                `,
            },
        ];

        const classificationResponse = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0,
        max_tokens: 200,
        response_format: { type: "json_object" },   // <── enforces pure JSON
        });

        const aiResponse = JSON.parse(classificationResponse.choices[0].message.content.trim());

        res.status(200).json({
            description: aiResponse.description || 'No description generated.',
            priority: aiResponse.priority || 'Moderate',
        });
    } catch (error) {
        console.error('Error processing AI generation:', error.message);
        res.status(500).json({ error: 'Failed to generate description and priority.' });
    }
});

/**
 * @swagger
 * /api/issues/update/{id}:
 *   put:
 *     summary: Update an existing issue
 *     description: Allows a citizen to update the details of an existing issue by providing updated data.
 *     tags:
 *       - Issues
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the issue to update
 *         schema:
 *           type: string
 *       - in: formData
 *         name: description
 *         required: false
 *         description: Updated description of the issue
 *         schema:
 *           type: string
 *       - in: formData
 *         name: address
 *         required: false
 *         description: Updated address of the issue
 *         schema:
 *           type: string
 *       - in: formData
 *         name: category
 *         required: false
 *         description: Updated category of the issue
 *         schema:
 *           type: string
 *       - in: formData
 *         name: photo
 *         required: false
 *         description: Updated photo file
 *         schema:
 *           type: file
 *       - in: formData
 *         name: audio
 *         required: false
 *         description: Updated audio file
 *         schema:
 *           type: file
 *     responses:
 *       200:
 *         description: Issue updated successfully
 *       400:
 *         description: Bad request, invalid input
 *       404:
 *         description: Issue not found
 *       500:
 *         description: Internal server error
 */

router.put(
    '/update/:id',
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'audio', maxCount: 1 },
    ]),
    [
        body('description').optional().isString().withMessage('Description must be a string.'),
        body('address').optional().notEmpty().withMessage('Address cannot be empty if provided.'),
    ],
    verifyToken(['Citizen', 'Authority']),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const issueId = req.params.id;
            const { description, address, category, priority } = req.body;

            const photoFile = req.files?.photo ? req.files.photo[0] : null;
            const audioFile = req.files?.audio ? req.files.audio[0] : null;

            const photoUrl = photoFile
                ? process.env.SERVER_URL + '/' + photoFile.path.replace(/\\/g, '/').replace('public/', '')
                : null;
            const audioUrl = audioFile
                ? process.env.SERVER_URL + '/' + audioFile.path.replace(/\\/g, '/').replace('public/', '')
                : null;

            const updateFields = {};
            if (description) updateFields.description = description;
            if (address) updateFields.address = address;
            if (category) updateFields.category = category;
            if (photoUrl) updateFields.photoUrl = photoUrl;
            if (audioUrl) updateFields.audioUrl = audioUrl;
            if (priority) updateFields.priority = priority;

            // Ensure at least one field is being updated
            if (Object.keys(updateFields).length === 0) {
                return res.status(400).json({
                    error: 'At least one field (description, address, photo, or audio) must be provided for the update.',
                });
            }

            // Find and update the issue
            const updatedIssue = await Issue.findByIdAndUpdate(issueId, updateFields, { new: true });
            if (!updatedIssue) {
                return res.status(404).json({ error: 'Issue not found.' });
            }

            res.status(200).json({
                message: 'Issue updated successfully.',
                issue: updatedIssue,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'An error occurred while updating the issue.' });
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
    try {
        const { id } = req.params;

        // Validate the issue ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).send('Malformed issue ID');
        }

        const userId = req.user._id; // Get the user ID from the token (assumed to be in req.user)

        // Use aggregation to fetch the issue with comments, their creators, and team details
        const issueData = await Issue.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id) }, // Match the issue by ID
            },
            {
                $lookup: {
                    from: 'users', // Name of the User collection
                    let: { creatorId: '$createdBy' }, // Pass the createdBy field
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$creatorId'] }, // Match the User ID
                            },
                        },
                        {
                            $project: { // Select only required fields
                                _id: 1,
                                fullname: 1,
                                email: 1,
                                role: 1,
                            },
                        },
                    ],
                    as: 'createdByDetails', // Output array field
                },
            },
            {
                $unwind: {
                    path: '$createdByDetails',
                    preserveNullAndEmptyArrays: true, // Handle cases where creator details might be missing
                },
            },
            {
                $lookup: {
                    from: 'comments', // Name of the Comment collection
                    localField: '_id', // Match the Issue ID with the `issue` field in the Comment collection
                    foreignField: 'issue',
                    as: 'commentDetails',
                },
            },
            {
                $lookup: {
                    from: 'users', // Name of the User collection
                    let: { commentCreatorIds: '$commentDetails.createdBy' }, // Pass the createdBy field
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$commentCreatorIds'] }, // Match User IDs in the list
                            },
                        },
                        {
                            $project: { // Select only required fields
                                _id: 1,
                                fullname: 1,
                                email: 1,
                                role: 1,
                            },
                        },
                    ],
                    as: 'commentCreators', // Output array field
                },
            },
            {
                $addFields: {
                    comments: {
                        $map: {
                            input: '$commentDetails',
                            as: 'comment',
                            in: {
                                _id: '$$comment._id',
                                content: '$$comment.content',
                                createdAt: '$$comment.createdAt',
                                createdBy: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$commentCreators',
                                                as: 'creator',
                                                cond: { $eq: ['$$creator._id', '$$comment.createdBy'] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                                status: '$$comment.status', // Include status
                                reason: '$$comment.reason', // Include reason
                            },
                        },
                    },
                },
            },
            {
                // Only return "Pending" comments if the user is the owner of the comment
                $addFields: {
                    comments: {
                        $map: {
                            input: '$comments',
                            as: 'comment',
                            in: {
                                $cond: {
                                    if: { $eq: ['$$comment.status', 'Pending'] },
                                    then: {
                                        $cond: {
                                            if: { $eq: ['$$comment.createdBy._id', new mongoose.Types.ObjectId(userId)] },
                                            then: '$$comment',
                                            else: null,
                                        },
                                    },
                                    else: '$$comment',
                                },
                            },
                        },
                    },
                },
            },
            {
                // Remove null values from the comments array
                $addFields: {
                    comments: {
                        $filter: {
                            input: '$comments',
                            as: 'comment',
                            cond: { $ne: ['$$comment', null] },
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'teams', // Name of the Team collection
                    localField: 'team', // Match the Issue's team field
                    foreignField: '_id',
                    as: 'teamDetails',
                },
            },
            {
                $unwind: {
                    path: '$teamDetails',
                    preserveNullAndEmptyArrays: true, // Handle cases where team details might be missing
                },
            },
            {
                $project: {
                    _id: 1,
                    description: 1,
                    photoUrl: 1,
                    audioUrl: 1,
                    address: 1,
                    priority: 1,
                    status: 1,
                    issueNumber: 1,
                    category: 1,
                    createdBy: '$createdByDetails',
                    comments: 1,
                    transcription: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    team: {
                        _id: '$teamDetails._id',
                        name: '$teamDetails.name',
                        image: '$teamDetails.image',
                        category: '$teamDetails.category',
                        availability: '$teamDetails.availability',
                        teamNumber: '$teamDetails.teamNumber',
                    }, // Include the team details
                },
            },
        ]);

        // If no issue is found, return an error
        if (!issueData || issueData.length === 0) {
            return res.status(404).send('Issue not found');
        }

        // Return the first issue in the result (since IDs are unique)
        return res.status(200).json(issueData[0]);
    } catch (error) {
        console.error('Error fetching issue:', error);
        return res.status(500).send('Internal Server Error');
    }
});


router.get('/explore/getOneIssue/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate the issue ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).send('Malformed issue ID');
        }

        // Use aggregation to fetch the issue with comments, their creators, and team details
        const issueData = await Issue.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id) }, // Match the issue by ID
            },
            {
                $lookup: {
                    from: 'users', // Name of the User collection
                    let: { creatorId: '$createdBy' }, // Pass the createdBy field
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$creatorId'] }, // Match the User ID
                            },
                        },
                        {
                            $project: { // Select only required fields
                                _id: 1,
                                fullname: 1,
                                email: 1,
                                role: 1,
                            },
                        },
                    ],
                    as: 'createdByDetails', // Output array field
                },
            },
            {
                $unwind: {
                    path: '$createdByDetails',
                    preserveNullAndEmptyArrays: true, // Handle cases where creator details might be missing
                },
            },
            {
                $lookup: {
                    from: 'comments', // Name of the Comment collection
                    localField: '_id', // Match the Issue ID with the `issue` field in the Comment collection
                    foreignField: 'issue',
                    as: 'commentDetails',
                },
            },
            {
                $lookup: {
                    from: 'users', // Name of the User collection
                    let: { commentCreatorIds: '$commentDetails.createdBy' }, // Pass the createdBy field
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$commentCreatorIds'] }, // Match User IDs in the list
                            },
                        },
                        {
                            $project: { // Select only required fields
                                _id: 1,
                                fullname: 1,
                                email: 1,
                                role: 1,
                            },
                        },
                    ],
                    as: 'commentCreators', // Output array field
                },
            },
            {
                $addFields: {
                    comments: {
                        $map: {
                            input: '$commentDetails',
                            as: 'comment',
                            in: {
                                _id: '$$comment._id',
                                content: '$$comment.content',
                                createdAt: '$$comment.createdAt',
                                createdBy: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$commentCreators',
                                                as: 'creator',
                                                cond: { $eq: ['$$creator._id', '$$comment.createdBy'] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'teams', // Name of the Team collection
                    localField: 'team', // Match the Issue's team field
                    foreignField: '_id',
                    as: 'teamDetails',
                },
            },
            {
                $unwind: {
                    path: '$teamDetails',
                    preserveNullAndEmptyArrays: true, // Handle cases where team details might be missing
                },
            },
            {
                $project: {
                    _id: 1,
                    description: 1,
                    photoUrl: 1,
                    audioUrl: 1,
                    address: 1,
                    priority: 1,
                    status: 1,
                    issueNumber: 1,
                    category: 1,
                    createdBy: '$createdByDetails',
                    comments: 1,
                    transcription: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    team: {
                        _id: '$teamDetails._id',
                        name: '$teamDetails.name',
                        image: '$teamDetails.image',
                        category: '$teamDetails.category',
                        availability: '$teamDetails.availability',
                        teamNumber: '$teamDetails.teamNumber',
                    }, // Include the team details
                },
            },
        ]);

        // If no issue is found, return an error
        if (!issueData || issueData.length === 0) {
            return res.status(404).send('Issue not found');
        }

        // Return the first issue in the result (since IDs are unique)
        return res.status(200).json(issueData[0]);
    } catch (error) {
        console.error('Error fetching issue:', error);
        return res.status(500).send('Internal Server Error');
    }
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

/**
 * @swagger
 * /api/issues/getTeamIssues:
 *   get:
 *     summary: Fetch team issues with upvote counts
 *     description: Retrieves all team issues with upvote counts, sorted by creation date (newest first).
 *     tags:
 *       - Issues
 *     responses:
 *       200:
 *         description: Successfully fetched issues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "615ecf2edc78b2aefc5d10b5"
 *                     description: "Unique identifier of the issue."
 *                   description:
 *                     type: string
 *                     example: "Issue related to server downtime"
 *                     description: "Description of the issue."
 *                   photoUrl:
 *                     type: string
 *                     example: "http://example.com/image.png"
 *                     description: "URL of the associated image."
 *                   audioUrl:
 *                     type: string
 *                     example: "http://example.com/audio.mp3"
 *                     description: "URL of the associated audio."
 *                   address:
 *                     type: string
 *                     example: "123 Main St"
 *                     description: "Address related to the issue."
 *                   priority:
 *                     type: string
 *                     example: "Critical"
 *                     description: "Priority of the issue."
 *                   status:
 *                     type: string
 *                     example: "Pending"
 *                     description: "Status of the issue."
 *                   upvoteCount:
 *                     type: number
 *                     example: 15
 *                     description: "Total number of upvotes for the issue."
 *                   createdAt:
 *                     type: string
 *                     example: "2023-10-12T12:00:00.000Z"
 *                     description: "Creation date of the issue."
 *                   updatedAt:
 *                     type: string
 *                     example: "2023-12-12T12:00:00.000Z"
 *                     description: "Last updated date of the issue."
 *       500:
 *         description: Server encountered an unexpected error
 */
router.get(
    '/getTeamIssues',
    async (req, res) => {
        try {
            // Fetch issues, projecting upvote count
            const issues = await Issue.aggregate([
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

router.put('/assignTeam/:issueId', verifyToken(['Admin', 'Authority', 'Citizen']), async (req, res) => {
    const issueId = req.params.issueId;
    const { teamId } = req.body;
    if (!mongoose.isValidObjectId(issueId)) {
        return res.status(400).send({ message: 'Malformed issue ID' });
    }

    try {
        const issue = await Issue.findById(issueId);

        if (!issue) {
            return res.status(404).send({ message: 'Issue not found' });
        }
        issue.team = teamId;

        await issue.save();

        return res.status(200).send({ message: 'Team successfully assigned' });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
});

router.put('/updateStatus/:issueId', verifyToken(['Admin', 'Authority', 'Citizen']), async (req, res) => {
    const issueId = req.params.issueId;
    const { status } = req.body;
    if (!mongoose.isValidObjectId(issueId)) {
        return res.status(400).send({ message: 'Malformed issue ID' });
    }

    try {
        const issue = await Issue.findById(issueId);

        if (!issue) {
            return res.status(404).send({ message: 'Issue not found' });
        }
        issue.status = status;

        await issue.save();

        return res.status(200).send({ message: 'Status successfully updated' });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * /api/issues/delete/{id}:
 *   delete:
 *     summary: Delete an issue
 *     description: Deletes an issue by its ID. Requires authentication with roles Admin, Authority, or Citizen.
 *     tags:
 *       - Issues
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the issue to delete
 *     responses:
 *       200:
 *         description: Issue successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Issue successfully deleted!
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Issue not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Issue not found
 */
router.delete('/delete/:id', verifyToken(['Admin', 'Authority', 'Citizen']), async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).send({ message: 'Issue not found' });
        }
        await Issue.deleteOne({ _id: req.params.id });
        return res.send({ message: 'Issue successfully deleted!' });
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error' });
    }
});


module.exports = router;