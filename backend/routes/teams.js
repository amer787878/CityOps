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
 *     description: Fetches a list of all teams with their members and team information
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
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
 *                   members:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         fullname:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "john.doe@example.com"
 *                         role:
 *                           type: string
 *                           example: "Manager"
 *       401:
 *         description: Unauthorized, invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/', verifyToken(['Authority']), async (req, res) => {
    try {
        const teams = await Team.find()
            .select('-__v') // Exclude the `__v` field
            .populate({
                path: 'members',
                select: 'fullname email role' // Include specific fields from the User schema
            })

        return res.send(teams);
    } catch (error) {
        return res.status(500).send({ status: "error", message: error.message });
    }
});

/**
 * @swagger
 * /api/teams/create:
 *   post:
 *     summary: Create a new team
 *     description: Creates a new team with a name, members, and an image.
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
 *               members:
 *                 type: string
 *                 description: JSON string representing an array of member IDs.
 *                 example: '["603e2b9e8e0f8e6d88f7b123", "603e2b9e8e0f8e6d88f7b124"]'
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
 *                   example: "Missing required fields. Ensure 'name', 'members', and 'image' are provided."
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
    const { name, members, category, availability } = req.body;

    if (!name || !members || !req.file) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required fields. Ensure "name", "members", and "image" are provided.',
            reasonPhrase: 'InvalidRequestBodyError'
        });
    }

    // Parse members to ensure it's an array
    let membersArray;
    try {
        membersArray = Array.isArray(members) ? members : [members];
        if (!Array.isArray(membersArray)) {
            throw new Error('Invalid format for "members".');
        }
    } catch (err) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid format for "members". It should be an array or a single member ID.',
            reasonPhrase: 'InvalidMembersFormatError'
        });
    }

    const teamData = {
        name,
        members: membersArray,
        category,
        availability,
        image: `${process.env.SERVER_URL}/${req.file.path.replace(/\\/g, '/').replace('public/', '')}`,
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
 *     description: Updates a team's name, members, or image based on the provided fields.
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
 *               members:
 *                 type: string
 *                 description: JSON string representing an array of updated member IDs.
 *                 example: '["603e2b9e8e0f8e6d88f7b124", "603e2b9e8e0f8e6d88f7b125"]'
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
 *                   example: "At least one field (name, members, or image) must be provided for the update."
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
    if (!req.body.name && !req.body.members && !req.file) {
        return res.status(400).send({
            status: 'error',
            message: 'At least one field (name, members, or image) must be provided for the update.',
            reasonPhrase: 'EmptyRequestBodyError'
        });
    }

    // Parse members if provided
    let membersArray = undefined;
    if (req.body.members) {
        try {
            membersArray = Array.isArray(req.body.members) ? req.body.members : [req.body.members];
            if (!Array.isArray(membersArray)) {
                throw new Error('Invalid format for "members".');
            }
        } catch (err) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid format for "members". It should be an array or a single member ID.',
                reasonPhrase: 'InvalidMembersFormatError'
            });
        }
    }

    const updatedData = {};
    if (req.body.name) updatedData.name = req.body.name;
    if (membersArray) updatedData.members = membersArray;
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
 *     description: Fetches the details of a single team by ID from the database
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
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fullname:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       role:
 *                         type: string
 *                         example: "Manager"
 *       400:
 *         description: Invalid ID format or team not found
 *       401:
 *         description: Unauthorized, invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/getOneTeam/:id', verifyToken(['Authority']), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Malformed team id');
    }

    const team = await Team.findById(req.params.id).populate({
        path: 'members',
        select: 'fullname email role' // Include specific fields from the User schema
    }).select('-__v');
    if (!team) {
        return res.status(400).send('team not found');
    }

    return res.send(team);
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

/**
 * @swagger
 * /api/teams/getTeamMembers:
 *   get:
 *     summary: Retrieve all team members with the "Authority" role
 *     description: Returns a list of users who have the role of "Authority."
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of team members with "Authority" role
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
 *                   fullname:
 *                     type: string
 *                     example: "Jane Doe"
 *                   email:
 *                     type: string
 *                     example: "jane.doe@example.com"
 *                   role:
 *                     type: string
 *                     example: "Authority"
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
 *                   example: "Failed to retrieve team members."
 */
router.get('/getTeamMembers', verifyToken(['Authority']), async (req, res) => {
    const authorities = await User.find({ role: 'Authority' });
    return res.send(authorities);
});


module.exports = router;