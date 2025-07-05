const express = require('express');
const { body, validationResult } = require('express-validator');
const Issue = require('../models/Issue');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Create new issue
router.post('/', [
    authMiddleware,
    body('category').notEmpty(),
    body('description').notEmpty(),
    body('longitude').isNumeric(),
    body('latitude').isNumeric(),
    body('imageUrl').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { category, description, longitude, latitude, imageUrl } = req.body;

        const issue = new Issue({
            userId: req.user._id,
            category,
            description,
            longitude,
            latitude,
            imageUrl
        });

        await issue.save();

        // Award points to user
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { rewards: 10 }
        });

        res.status(201).json(issue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all issues (admin only)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const issues = await Issue.find()
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.json(issues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get map data for admin
router.get('/admin/map', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const issues = await Issue.find({}, 'longitude latitude _id category status');
        res.json(issues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get issue details
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate('userId', 'firstName lastName email phone');
        
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        res.json(issue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's issues
router.get('/user/my-issues', authMiddleware, async (req, res) => {
    try {
        const issues = await Issue.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(issues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update issue status (admin only)
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        
        const issue = await Issue.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('userId', 'firstName lastName email');

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        res.json(issue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
