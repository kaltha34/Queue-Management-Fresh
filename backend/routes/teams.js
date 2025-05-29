const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Team = require('../models/Team');
const User = require('../models/User');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devora_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if user is mentor or admin
const isMentorOrAdmin = (req, res, next) => {
  if (req.user.user.role === 'mentor' || req.user.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Not authorized.' });
  }
};

// @route   GET /api/teams
// @desc    Get all teams
// @access  Public
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().populate('mentor', 'name email');
    res.json(teams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/teams/:id
// @desc    Get team by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('mentor', 'name email');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/teams
// @desc    Create a team
// @access  Private (Mentor/Admin only)
router.post('/', verifyToken, isMentorOrAdmin, async (req, res) => {
  try {
    const { name, description, category, location, capacity, meetingDays, meetingTime } = req.body;

    // Create new team
    const newTeam = new Team({
      name,
      description,
      category,
      mentor: req.user.user.id,
      location,
      capacity,
      meetingDays,
      meetingTime
    });

    const team = await newTeam.save();
    res.json(team);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/teams/:id
// @desc    Update a team
// @access  Private (Mentor/Admin only)
router.put('/:id', verifyToken, isMentorOrAdmin, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is the team mentor or an admin
    if (team.mentor.toString() !== req.user.user.id && req.user.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this team' });
    }
    
    const { name, description, category, location, capacity, isActive, meetingDays, meetingTime } = req.body;
    
    // Update team fields
    if (name) team.name = name;
    if (description) team.description = description;
    if (category) team.category = category;
    if (location) team.location = location;
    if (capacity) team.capacity = capacity;
    if (isActive !== undefined) team.isActive = isActive;
    if (meetingDays) team.meetingDays = meetingDays;
    if (meetingTime) team.meetingTime = meetingTime;
    
    await team.save();
    res.json(team);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/teams/:id
// @desc    Delete a team
// @access  Private (Mentor/Admin only)
router.delete('/:id', verifyToken, isMentorOrAdmin, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is the team mentor or an admin
    if (team.mentor.toString() !== req.user.user.id && req.user.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this team' });
    }
    
    await team.remove();
    res.json({ message: 'Team removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
