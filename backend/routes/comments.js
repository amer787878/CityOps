const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const verifyToken = require('../utils/verifyToken');

const router = require('express').Router();

router.post('/postComment', verifyToken(['Citizen']), async (req, res) => {
    try {
        const comment = new Comment({
            content: req.body.content,
            createdBy: req.user._id,
            issue: req.body.issueId,
        })

        const notification = new Notification({
            type: "New Comment",
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