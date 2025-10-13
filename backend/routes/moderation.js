const Comment = require('../models/Comment');
const Issue = require('../models/Issue');
const verifyToken = require('../utils/verifyToken');

const router = require('express').Router();

router.get('/', verifyToken(['Admin']), async (req, res) => {
    try {
        const pendingSubmissionIssues = await Issue.find()
            .select('-__v')
            .populate({
                path: 'createdBy',
                select: 'fullname email role'
            })

        const reportedComments = await Comment.find()
            .select('-__v')
            .populate({
                path: 'createdBy',
                select: 'fullname email role'
            })
            .populate({
                path: 'issue',
                select: 'issueNumber'
            })

        return res.send({pendingSubmissionIssues, reportedComments});
    } catch (error) {
        return res.status(500).send({ status: "error", message: error.message });
    }
});

module.exports = router;