const User = require('../models/User');
const verifyToken = require('../utils/verifyToken');

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

module.exports = router;