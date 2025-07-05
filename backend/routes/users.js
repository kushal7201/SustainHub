const express = require('express');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { firstName, lastName, phone, address } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { firstName, lastName, phone, address },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user by ID (for admin)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get leaderboard data with pagination
router.get('/leaderboard/:page?', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.params.page) || 1;
        const limit = 10; // Number of users per page
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const totalUsers = await User.countDocuments({ role: 'USER' });
        const totalPages = Math.ceil(totalUsers / limit);

        // Get users sorted by rewards (descending) with pagination
        const users = await User.find({ role: 'USER' })
            .select('firstName lastName rewards')
            .sort({ rewards: -1, createdAt: 1 }) // Secondary sort by join date for ties
            .skip(skip)
            .limit(limit);

        // Add rank to each user
        const usersWithRank = users.map((user, index) => ({
            ...user.toObject(),
            rank: skip + index + 1
        }));

        res.json({
            users: usersWithRank,
            pagination: {
                currentPage: page,
                totalPages,
                totalUsers,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
