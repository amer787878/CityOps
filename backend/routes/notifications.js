const express = require('express');
const Notification = require('../models/Notification');
const verifyToken = require('../utils/verifyToken');
const router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Retrieve all notifications
 *     description: Fetches all notifications, including details about the associated user and issue.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all notifications
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
 *                   message:
 *                     type: string
 *                     example: "New issue assigned to you."
 *                   user:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "603e2b9e8e0f8e6d88f7b456"
 *                       fullname:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       role:
 *                         type: string
 *                         example: "Authority"
 *                   issue:
 *                     type: string
 *                     example: "604e2b9e8e0f8e6d88f7b789"
 *                   read:
 *                     type: boolean
 *                     example: false
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-14T12:34:56.789Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-14T12:34:56.789Z"
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
 *                   example: "Failed to retrieve notifications. Database error message."
 */
router.get('/', verifyToken(['Authority']), async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;

        // Build the query object
        const query = {};
        if (type) {
            query.type = type; // Filter by notification type
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate), // Greater than or equal to startDate
                $lte: new Date(endDate), // Less than or equal to endDate
            };
        } else if (startDate) {
            query.createdAt = {
                $gte: new Date(startDate),
            };
        } else if (endDate) {
            query.createdAt = {
                $lte: new Date(endDate),
            };
        }

        // Fetch notifications with filters applied
        const notifications = await Notification.find(query)
            .select('-__v')
            .populate({
                path: 'user',
                select: 'fullname email role', // Include specific fields from the User schema
            })
            .populate({
                path: 'issue', // Populate the issue field if present
                select: 'issueNumber description status', // Adjust fields as necessary
            });

        return res.status(200).send(notifications);
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Failed to retrieve notifications. " + error.message,
        });
    }
});


module.exports = router;
