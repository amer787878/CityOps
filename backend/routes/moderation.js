const Comment = require('../models/Comment');
const Issue = require('../models/Issue');
const verifyToken = require('../utils/verifyToken');

const router = require('express').Router();

router.get('/', verifyToken(['Admin']), async (req, res) => {
    try {
        const pendingSubmissionIssues = await Issue.find({ status: 'Pending' })
            .select('-__v')
            .populate({
                path: 'createdBy',
                select: 'fullname email role'
            });

        const reportedComments = await Comment.find({ status: { $ne: 'Approved' } })
            .select('-__v')
            .populate({
                path: 'createdBy',
                select: 'fullname email role'
            })
            .populate({
                path: 'issue',
                select: 'issueNumber'
            });
        return res.send({ pendingSubmissionIssues, reportedComments });
    } catch (error) {
        return res.status(500).send({ status: "error", message: error.message });
    }
});

// Approve issue
router.post('/approve/issue/:id', verifyToken(['Admin']), async (req, res) => {
    try {
        const issue = await Issue.findByIdAndUpdate(req.params.id, { status: 'Approved' }, { new: true });
        if (!issue) {
            return res.status(404).send({ message: 'Issue not found' });
        }
        return res.send({ message: 'Issue approved successfully', issue });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
});

// Reject issue with reason
router.post('/reject/issue/:id', verifyToken(['Admin']), async (req, res) => {
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).send({ message: 'Rejection reason is required' });
    }

    try {
        const issue = await Issue.findByIdAndUpdate(req.params.id, 
            { 
                status: 'Rejected', 
                reason: reason
            }, 
            { new: true }
        );
        
        if (!issue) {
            return res.status(404).send({ message: 'Issue not found' });
        }

        return res.send({ message: 'Issue rejected successfully', issue, reason });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
});

// Approve comment
router.post('/approve/comment/:id', verifyToken(['Admin']), async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, { status: 'Approved' }, { new: true });
        if (!comment) {
            return res.status(404).send({ message: 'Comment not found' });
        }
        return res.send({ message: 'Comment approved successfully', comment });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
});

// Reject comment
router.post('/reject/comment/:id', verifyToken(['Admin']), async (req, res) => {
    const { reason } = req.body; 
    if (!reason) {
        return res.status(400).send({ message: 'Rejection reason is required' });
    }

    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, 
            { 
                status: 'Declined', 
                reason: reason
            }, 
            { new: true }
        );
        
        if (!comment) {
            return res.status(404).send({ message: 'Comment not found' });
        }

        return res.send({ message: 'Comment rejected successfully', comment, reason });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
});


module.exports = router;