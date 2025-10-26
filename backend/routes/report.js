const express = require('express');
const User = require('../models/User');
const Issue = require('../models/Issue');
const verifyToken = require('../utils/verifyToken');
const router = express.Router();

router.get('/admin', verifyToken(['Admin']), async (req, res) => {
    try {
        const { startDate, endDate, userRole, location, reportType } = req.query;

        // Build filters for issues
        const issueFilters = {};

        if (startDate && endDate) {
            issueFilters.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        if (userRole) {
            const users = await User.find({ role: userRole }).select('_id');
            issueFilters.createdBy = { $in: users.map((user) => user._id) };
        }

        if (location) {
            issueFilters.address = { $regex: new RegExp(location, 'i') }; // Case-insensitive partial match
        }

        // Handle Report Types
        let chartData;

        if (reportType === 'userActivity') {
            // User Activity Report: Issues submitted and comments posted by users
            chartData = await User.aggregate([
                {
                    $lookup: {
                        from: 'issues',
                        localField: '_id',
                        foreignField: 'createdBy',
                        as: 'userIssues',
                    },
                },
                {
                    $lookup: {
                        from: 'comments',
                        localField: '_id',
                        foreignField: 'createdBy',
                        as: 'userComments',
                    },
                },
                {
                    $project: {
                        fullname: 1,
                        issuesSubmitted: { $size: '$userIssues' },
                        commentsPosted: { $size: '$userComments' },
                    },
                },
            ]);

            // Format data for charting (e.g., bar chart)
            chartData = chartData.map((data) => ({
                name: data.fullname,
                issues: data.issuesSubmitted,
                comments: data.commentsPosted,
            }));
        } else if (reportType === 'issueStatistics') {
            // Issue Statistics Report: Issues by category and resolution status
            chartData = await Issue.aggregate([
                { $match: issueFilters },
                {
                    $group: {
                        _id: '$category',
                        totalIssues: { $sum: 1 },
                        resolvedIssues: {
                            $sum: {
                                $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0],
                            },
                        },
                    },
                },
            ]);

            // Format data for charting (e.g., pie chart or bar chart)
            chartData = chartData.map((data) => ({
                category: data._id || 'Uncategorized',
                totalIssues: data.totalIssues,
                resolvedIssues: data.resolvedIssues,
            }));
        } else if (reportType === 'engagement') {
            // Engagement Report: Upvotes and comments per issue
            chartData = await Issue.aggregate([
                { $match: issueFilters },
                {
                    $project: {
                        description: 1,
                        upvotesCount: { $size: '$upvotes' },
                        commentsCount: {
                            $size: {
                                $ifNull: ['$comments', []], // Assuming `comments` is a field in the Issue model
                            },
                        },
                    },
                },
            ]);

            // Format data for charting (e.g., scatter or bar chart)
            chartData = chartData.map((data) => ({
                issue: data.description,
                upvotes: data.upvotesCount,
                comments: data.commentsCount,
            }));
        } else {
            // Invalid report type
            return res.status(400).json({
                success: false,
                message: 'Invalid report type provided.',
            });
        }

        // Return chart-ready data
        return res.json({
            success: true,
            reportType,
            chartData,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while generating the chart data.',
        });
    }
});

module.exports = router;
