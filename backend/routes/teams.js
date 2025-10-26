const Team = require('../models/Team');
const verifyToken = require('../utils/verifyToken');
const multer = require("multer");
const mongoose = require('mongoose');
const User = require('../models/User');

const router = require('express').Router();

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, "public/uploads/teams/"), // Define storage location
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${file.originalname}`;
            cb(null, uniqueSuffix);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"));
        }
    },
});

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Retrieve all teams
 *     description: Fetches a list of all teams along with their details, including team if populated.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter teams by category (e.g., Road Repair, Waste Disposal, Streetlight Maintenance)
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           enum: [Available, Busy]
 *         description: Filter teams by availability status.
 *     responses:
 *       200:
 *         description: Successfully retrieved teams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "603e2b9e8e0f8e6d88f7b123"
 *                   name:
 *                     type: string
 *                     example: "Team Alpha"
 *                   image:
 *                     type: string
 *                     example: "https://example.com/team-image.png"
 *                   category:
 *                     type: string
 *                     example: "Road Repair"
 *                   availability:
 *                     type: string
 *                     example: "Available"
 *                   teamNumber:
 *                     type: number
 *                     example: 1001
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-01-23T10:23:45.123Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-01-23T10:30:45.123Z"
 *       401:
 *         description: Unauthorized, invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */
router.get('/', verifyToken(['Authority']), async (req, res) => {
    try {
        const { category, availability } = req.query;

        // Filter object for MongoDB query
        const filter = {};
        if (category) filter.category = category;
        if (availability) filter.availability = availability;

        const teams = await Team.find(filter).select('-__v');
        return res.status(200).json(teams);
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Internal server error: " + error.message });
    }
});

/**
 * @swagger
 * /api/teams/create:
 *   post:
 *     summary: Create a new team
 *     description: Creates a new team with a name, category, availability, and an image.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the team.
 *                 example: "Team Alpha"
 *               category:
 *                 type: string
 *                 enum:
 *                   - Road Repair
 *                   - Waste Disposal
 *                   - Streetlight Maintenance
 *                 description: The category of the team.
 *                 example: "Road Repair"
 *               availability:
 *                 type: string
 *                 enum:
 *                   - Available
 *                   - Busy
 *                 description: Availability status of the team.
 *                 example: "Available"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Team image file.
 *     responses:
 *       200:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "The team data was created successfully!"
 *       400:
 *         description: Missing required fields or invalid data format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Missing required fields. Ensure 'name', 'category', and 'image' are provided."
 *                 reasonPhrase:
 *                   type: string
 *                   example: "InvalidRequestBodyError"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Failed to create the team. Database error message."
 */
router.post('/create', verifyToken(['Authority']), upload.single("image"), async (req, res) => {
    const { name, category, availability } = req.body;

    if (!name || !req.file) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required fields. Ensure "name", "category", and "image" are provided.',
            reasonPhrase: 'InvalidRequestBodyError'
        });
    }

    const existedTeam = await Team.findOne({ name: name });
    if (existedTeam) { return res.status(400).send({ message: 'Team name already used.' }); }

    const teamData = {
        name,
        category,
        availability,
        image: `/uploads/teams/${req.file.filename}`
    };

    try {
        await Team.create(teamData);
        return res.status(200).json({
            status: "success",
            message: "The team data was created successfully!"
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to create the team. " + error.message,
        });
    }
});

/**
 * @swagger
 * /teams/update/{id}:
 *   put:
 *     summary: Update a team's details
 *     description: Updates a team's name, category, availability, or image based on the provided fields.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the team to be updated
 *         required: true
 *         schema:
 *           type: string
 *           example: "603e2b9e8e0f8e6d88f7b123"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name for the team.
 *                 example: "Team Beta"
 *               category:
 *                 type: string
 *                 enum:
 *                   - Road Repair
 *                   - Waste Disposal
 *                   - Streetlight Maintenance
 *                 description: Updated category for the team.
 *                 example: "Waste Disposal"
 *               availability:
 *                 type: string
 *                 enum:
 *                   - Available
 *                   - Busy
 *                 description: Updated availability status of the team.
 *                 example: "Busy"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Updated team image file.
 *     responses:
 *       200:
 *         description: Team successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "The team data was updated successfully!"
 *       400:
 *         description: Missing required fields or invalid data format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "At least one field (name, category, availability, or image) must be provided for the update."
 *                 reasonPhrase:
 *                   type: string
 *                   example: "EmptyRequestBodyError"
 *       404:
 *         description: Team not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "The specified team does not exist."
 *                 reasonPhrase:
 *                   type: string
 *                   example: "TeamNotFoundError"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Failed to update the team. Database error message."
 */
router.put('/update/:id', verifyToken(['Authority']), upload.single("image"), async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send({
            status: 'error',
            message: 'The team ID is required to update a team.',
            reasonPhrase: 'MissingTeamIdError'
        });
    }

    // Validate required fields
    if (!req.body.name && !req.body.category && !req.body.availability && !req.file) {
        return res.status(400).send({
            status: 'error',
            message: 'At least one field (name, category, availability, or image) must be provided for the update.',
            reasonPhrase: 'EmptyRequestBodyError'
        });
    }

    const updatedData = {};
    if (req.body.name) updatedData.name = req.body.name;
    if (req.body.category) updatedData.category = req.body.category;
    if (req.body.availability) updatedData.availability = req.body.availability;
    if (req.file) {
        updatedData.image = process.env.SERVER_URL + '/' + req.file.path.replace(/\\/g, '/').replace('public/', '');
    }

    try {
        // Check if the team exists
        const existingTeam = await Team.findById(id);
        if (!existingTeam) {
            return res.status(404).send({
                status: 'error',
                message: 'The specified team does not exist.',
                reasonPhrase: 'TeamNotFoundError'
            });
        }

        // Update the team
        await Team.findByIdAndUpdate(id, updatedData, { new: true });

        return res.status(200).send({
            status: 'success',
            message: 'The team data was updated successfully!',
        });
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            message: 'Failed to update the team. ' + error.message,
        });
    }
});


/**
 * @swagger
 * /api/teams/getOneTeam/{id}:
 *   get:
 *     summary: Retrieve a single team by its ID
 *     description: Fetches the details of a single team by ID from the database.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the team to fetch
 *         required: true
 *         schema:
 *           type: string
 *           example: "603e2b9e8e0f8e6d88f7b123"
 *     responses:
 *       200:
 *         description: Successfully retrieved the team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "603e2b9e8e0f8e6d88f7b123"
 *                 name:
 *                   type: string
 *                   example: "Team Alpha"
 *                 image:
 *                   type: string
 *                   example: "https://example.com/image.png"
 *                 category:
 *                   type: string
 *                   example: "Road Repair"
 *                 availability:
 *                   type: string
 *                   example: "Available"
 *       400:
 *         description: Invalid ID format or team not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Malformed team ID or team not found."
 *       401:
 *         description: Unauthorized, invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "An error occurred while fetching the team."
 */
router.get('/getOneTeam/:id', verifyToken(['Authority']), async (req, res) => {
    const { id } = req.params;

    // Validate the ID format
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            status: 'error',
            message: 'Malformed team ID.',
        });
    }

    try {
        // Fetch the team by ID
        const team = await Team.findById(id).select('-__v');

        if (!team) {
            return res.status(400).json({
                status: 'error',
                message: 'Team not found.',
            });
        }

        // Send the team details
        return res.status(200).json(team);
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'An error occurred while fetching the team. ' + error.message,
        });
    }
});


/**
 * @swagger
 * /api/teams/delete/{id}:
 *   delete:
 *     summary: Delete a team by its ID
 *     description: Deletes a specific team from the database using its ID.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the team to delete
 *         required: true
 *         schema:
 *           type: string
 *           example: "603e2b9e8e0f8e6d88f7b123"
 *     responses:
 *       200:
 *         description: Team successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team successfully deleted!"
 *       400:
 *         description: Invalid or malformed ID
 *       401:
 *         description: Unauthorized, invalid token
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:id', verifyToken(['Authority']), async (req, res) => {
    await Team.deleteOne({ _id: req.params.id });
    return res.send({ message: 'Team successfully deleted!' });
});

module.exports = router;