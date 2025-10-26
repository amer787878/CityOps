const Comment = require('../models/Comment');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const verifyToken = require('../utils/verifyToken');

const router = require('express').Router();

/**
 * @swagger
 * /api/comments/postComment:
 *   post:
 *     summary: Add a comment to an issue and notify the user
 *     description: Allows a citizen to post a comment to a specific issue and sends a notification.
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - issueId
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is a comment example."
 *                 description: "Content of the comment."
 *               issueId:
 *                 type: string
 *                 example: "615ecf2edc78b2aefc5d10b5"
 *                 description: "ID of the issue to which the comment belongs."
 *     responses:
 *       200:
 *         description: Comment successfully posted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "successfully commented!"
 *       401:
 *         description: Unauthorized access.
 *       500:
 *         description: Server error occurred while commenting.
 */
router.post('/postComment', verifyToken(['Citizen', 'Admin', 'Authority']), async (req, res) => {
    try {
        const issue = await Issue.findById(req.body.issueId);
        const userId = req.user._id;

        if (issue.createdBy.toString() === userId.toString()) {
            return res.status(400).send({ message: 'You cannot comment your own issue' });
        }
        const comment = new Comment({
            content: req.body.content,
            createdBy: req.user._id,
            issue: req.body.issueId,
            status: "Pending"
        })

        const notification = new Notification({
            type: req.body.notificationType,
            user: req.user._id,
            issue: req.body.issueId,
            message: req.body.content,
        });

        await comment.save();
        await notification.save();

        return res.status(200).send({ message: 'successfully commented!' });
    } catch (error) {
        return res.status(500).send({ message: 'Server error occurred while commenting.' });
    }
});

module.exports = router;