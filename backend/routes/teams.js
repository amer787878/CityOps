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


router.post('/create', verifyToken(['Authority']), upload.single("image"), async (req, res) => {
    if (!req.body.name || !req.body.members || !req.file) {
        return res.status(400).send({
            status: 'error',
            message: 'Missing required fields. Ensure "name", "members", and "image" are provided.',
            reasonPhrase: 'InvalidRequestBodyError'
        });
    }

    const { name, members } = req.body;

    // Ensure members is an array
    let membersArray;
    try {
        membersArray = JSON.parse(members); // Parse members if sent as a JSON string
        if (!Array.isArray(membersArray)) {
            throw new Error("Members must be an array.");
        }
    } catch (err) {
        return res.status(400).send({
            status: 'error',
            message: 'Invalid format for "members". It should be an array of member IDs.',
            reasonPhrase: 'InvalidMembersFormatError'
        });
    }

    const teamData = {
        name,
        members: membersArray, // Store member IDs
        image: process.env.SERVER_URL + '/' + req.file.path.replace(/\\/g, '/').replace('public/', ''),
    };

    try {
        // Save the team to the database
        await Team.create(teamData);
        return res.status(200).send({ 
            status: "success", 
            message: "The team data was created successfully!" 
        });
    } catch (error) {
        return res.status(500).send({ 
            status: "error", 
            message: "Failed to create the team. " + error.message 
        });
    }
});

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
            membersArray = JSON.parse(req.body.members); // Parse members if sent as a JSON string
            if (!Array.isArray(membersArray)) {
                throw new Error("Members must be an array.");
            }
        } catch (err) {
            return res.status(400).send({
                status: 'error',
                message: 'Invalid format for "members". It should be an array of member IDs.',
                reasonPhrase: 'InvalidMembersFormatError'
            });
        }
    }

    const updatedData = {};
    if (req.body.name) updatedData.name = req.body.name;
    if (membersArray) updatedData.members = membersArray;
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


router.get('/getOneTeam/:id', verifyToken(['Authority']), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Malformed team id');
    }

    const team = await Team.findById(req.params.id).select('-__v');
    if (!team) {
        return res.status(400).send('team not found');
    }

    return res.send(team);
});

router.delete('/delete/:id', verifyToken(['Authority']), async (req, res) => {
    await Team.deleteOne({ _id: req.params.id });
    return res.send({ message: 'Team successfully deleted!' });
});

router.get('/getTeamMembers', verifyToken(['Authority']), async (req, res) => {
    const authorities = await User.find({ role: 'Authority' });
    return res.send(authorities);
});


module.exports = router;