const User = require('../models/User');
const verifyToken = require('../utils/verifyToken');
const mongoose = require('mongoose');

const router = require('express').Router();

/**
 * @openapi
 * /api/users/personal/me:
 *   get:
 *     summary: Get personal details of the authenticated user
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: User ID.
 *                     fullname:
 *                       type: string
 *                       description: Full name of the user.
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: User's email address.
 *                     role:
 *                       type: string
 *                       enum:
 *                         - Admin
 *                         - Citizen
 *                         - Authority
 *                       description: Role of the user.
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: User account creation timestamp.
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Last account update timestamp.
 *       401:
 *         description: Unauthorized. Missing or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Unauthorized.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 */

router.get('/personal/me', verifyToken(['Admin', 'Citizen', 'Authority']), async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -__v');
        return res.send({ user: user });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
});

/**
 * @openapi
 * /api/users:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Returns a list of users
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: A list of users.
 *       401:
 *         description: Unauthorized, missing or invalid token.
 */
router.get('/', verifyToken(['Admin', 'Citizen', 'Authority']), async (req, res) => {
    const roleFilter = req.query.role !== '' && typeof req.query.role !== 'undefined' ? { role: req.query.role } : {};
    const statusFilter = req.query.status !== '' && typeof req.query.status !== 'undefined' ? { status: req.query.status } : {};
    const filterParams = {
        $and: [
            statusFilter,
            roleFilter
        ],
    };

    const totalCount = await User.countDocuments({});
    const users = await User.find(filterParams).select('-password -__v');

    return res.send({
        totalCount,
        users,
        filteredCount: users.length,
    })
});

/**
 * @openapi
 * /api/users/logout:
 *   get:
 *     summary: Log out the current user
 *     description: Clear cookies to log the user out of the application.
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'successfully logout'
 *       500:
 *         description: Internal server error
 */
router.get('/logout', async (req, res) => {
    try {
        res.cookie('refreshToken', '', { maxAge: 1 });
        res.cookie('isLoggedIn', '', { maxAge: 1 });
        return res.status(200).send({ message: 'successfully logout' });
    } catch (error) {
        return res.status(500).send({ message: "Internal server error" });
    }
});

/**
 * @openapi
 * /api/users/delete/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user by ID. Only accessible by users with 'admin' role.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the user to be deleted.
 *     responses:
 *       200:
 *         description: User successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User successfully deleted!
 *       401:
 *         description: Unauthorized access, invalid or missing token.
 *       403:
 *         description: Forbidden action, user does not have necessary permissions.
 *       404:
 *         description: User not found with the given ID.
 *       500:
 *         description: Server error occurred while deleting the user.
 */

router.delete('/delete/:id', verifyToken(['Admin']), async (req, res) => {
    await User.deleteOne({ _id: req.params.id });
    return res.send({ message: 'User successfully deleted!' });
});

/**
 * @openapi
 * /api/users/suspend/{id}:
 *   put:
 *     summary: Suspend a user
 *     description: Suspends a user by ID. Only accessible by users with 'admin' role.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the user to suspend.
 *     responses:
 *       200:
 *         description: User successfully suspended.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User successfully suspended!
 *       401:
 *         description: Unauthorized access, invalid or missing token.
 *       403:
 *         description: Forbidden action, user does not have necessary permissions.
 *       404:
 *         description: User not found or already suspended.
 *       500:
 *         description: Server error occurred while suspending the user.
 */
router.put('/suspend/:id', verifyToken(['Admin']), async (req, res) => {
    try {
        const user = await User.updateOne(
            { _id: req.params.id },
            { $set: { status: 'Suspended' } }
        );

        if (user.nModified === 0) {
            return res.status(404).send({ message: 'User not found or already suspended!' });
        }

        return res.status(200).send({ message: 'User successfully suspended!' });
    } catch (error) {
        return res.status(500).send({ message: 'Server error occurred while suspending the user.' });
    }
});

/**
 * @swagger
 * /api/users/update/{id}:
 *   put:
 *     summary: Update user details
 *     description: Allows an admin to update user details. Only accessible by users with 'Admin' role via token verification.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The unique ID of the user to be updated
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Fields to update for the user
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *                 description: Full name of the user
 *               email:
 *                 type: string
 *                 description: Email address of the user
 *               role:
 *                 type: string
 *                 description: Role of the user
 *               status:
 *                 type: string
 *                 description: Status of the user
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updatedUser:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: User ID
 *                     fullname:
 *                       type: string
 *                       description: Full name of the user
 *                     email:
 *                       type: string
 *                       description: Email of the user
 *                     role:
 *                       type: string
 *                       description: Role of the user
 *                     status:
 *                       type: string
 *                       description: Status of the user
 *                 message:
 *                   type: string
 *                   description: Response message
 *       400:
 *         description: Duplicated email address
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/update/:id', verifyToken(['Admin']), async (req, res) => {
    try {
        const updateValues = req.body;
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.params.id }, // Correctly targeting the provided user ID
            updateValues,
            { new: true }
        ).select('-__v');

        if (!updatedUser) {
            return res.status(404).send({ message: 'User not found' });
        }

        return res.send({
            updatedUser,
            message: 'User successfully updated',
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).send({ message: 'Duplicated email, there is already an existing email' });
        }
        return res.status(500).send({ message: error.message || 'An unexpected error occurred' });
    }
});


/**
 * @swagger
 * /api/users/getOneUser/{id}:
 *   get:
 *     summary: Retrieve a single user's details
 *     description: Fetch the details of a specific user by ID. Only accessible by users with 'Admin' role via token verification.
 *     tags:
 *       - User
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The user's unique identifier (MongoDB ObjectId).
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The user's unique ID
 *                 fullname:
 *                   type: string
 *                   description: The full name of the user
 *                 email:
 *                   type: string
 *                   description: The user's email
 *                 role:
 *                   type: string
 *                   description: The role assigned to the user
 *                 status:
 *                   type: string
 *                   description: The current status of the user
 *       400:
 *         description: Malformed user id or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/getOneUser/:id', verifyToken(['Admin']), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Malformed user id');
    }

    const user = await User.findById(req.params.id).select('-__v');
    if (!user) {
        return res.status(400).send('user not found');
    }

    return res.send(user);
});


module.exports = router;