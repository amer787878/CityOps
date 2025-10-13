const express = require('express');
const Issue = require('../models/Issue');
const router = express.Router();

// Endpoint to fetch analytics data
router.get('/authority', async (req, res) => {
    try {
        const { startDate, endDate, location, category } = req.query;

        const matchFilters = {};
        
        // Date filter
        if (startDate || endDate) {
            matchFilters.createdAt = {};
            if (startDate) matchFilters.createdAt.$gte = new Date(startDate);
            if (endDate) matchFilters.createdAt.$lte = new Date(endDate);
        }

        // Location filter (case-insensitive)
        if (location) matchFilters.address = { $regex: location, $options: 'i' };

        // Category filter
        if (category) matchFilters.category = category;

        // Total Issues Count
        const totalIssues = await Issue.countDocuments(matchFilters);

        // Resolved Issues This Month
        const resolvedIssuesThisMonth = await Issue.countDocuments({
            ...matchFilters,
            status: 'Resolved',
            createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of the current month
            },
        });

        // Average Resolution Time
        const avgResolutionTime = await Issue.aggregate([
            { $match: { ...matchFilters, status: 'Resolved' } },
            {
                $project: {
                    resolutionTime: { $subtract: ['$updatedAt', '$createdAt'] },
                },
            },
            { $group: { _id: null, avgTime: { $avg: '$resolutionTime' } } },
        ]);

        // Issues by Category (for bar chart)
        const issuesByCategory = await Issue.aggregate([
            { $match: matchFilters },
            { $group: { _id: '$category', count: { $sum: 1 } } },
        ]);

        // Issues by Priority (for pie chart)
        const issuesByPriority = await Issue.aggregate([
            { $match: matchFilters },
            { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]);

        // Resolution Times Over Months (for line chart)
        const resolutionTimes = await Issue.aggregate([
            { $match: { ...matchFilters, status: 'Resolved' } },
            {
                $project: {
                    yearMonth: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } },
                    resolutionTime: { $subtract: ['$updatedAt', '$createdAt'] },
                },
            },
            { $group: { _id: '$yearMonth', avgResolutionTime: { $avg: '$resolutionTime' } } },
            { $sort: { _id: 1 } }, // Sort by month
        ]);

        const response = {
            totalIssues,
            resolvedIssuesThisMonth,
            avgResolutionTime: avgResolutionTime[0]?.avgTime || 0,
            issuesByCategory,
            issuesByPriority,
            resolutionTimes,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch analytics data.' });
    }
});

module.exports = router;
