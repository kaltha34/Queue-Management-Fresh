const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Queue = require('../models/Queue');
const Team = require('../models/Team');

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

// @route   GET /api/queues
// @desc    Get all active queues
// @access  Public
router.get('/', async (req, res) => {
  try {
    const queues = await Queue.find({ status: 'active' })
      .populate('team', 'name description category location')
      .populate('members.user', 'name email');
    
    res.json(queues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/queues/:id
// @desc    Get queue by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id)
      .populate('team', 'name description category location')
      .populate('members.user', 'name email');
    
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }
    
    res.json(queue);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Queue not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/queues
// @desc    Create a queue
// @access  Private (Mentor/Admin only)
router.post('/', verifyToken, isMentorOrAdmin, async (req, res) => {
  try {
    const { teamId, date, estimatedTimePerPerson } = req.body;
    
    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is the team mentor or an admin
    if (team.mentor.toString() !== req.user.user.id && req.user.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create a queue for this team' });
    }
    
    // Create new queue
    const newQueue = new Queue({
      team: teamId,
      date: date || new Date(),
      estimatedTimePerPerson: estimatedTimePerPerson || 15
    });
    
    const queue = await newQueue.save();
    res.json(queue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/queues/:id/status
// @desc    Update queue status (active, paused, closed)
// @access  Private (Mentor/Admin only)
router.put('/:id/status', verifyToken, isMentorOrAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'paused', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const queue = await Queue.findById(req.params.id).populate('team');
    
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }
    
    // Check if user is the team mentor or an admin
    if (queue.team.mentor.toString() !== req.user.user.id && req.user.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this queue' });
    }
    
    queue.status = status;
    await queue.save();
    
    res.json(queue);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Queue not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/queues/:id/join
// @desc    Join a queue
// @access  Private
router.post('/:id/join', verifyToken, async (req, res) => {
  try {
    const { projectInterest } = req.body;
    const queue = await Queue.findById(req.params.id);
    
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }
    
    if (queue.status !== 'active') {
      return res.status(400).json({ message: 'Queue is not active' });
    }
    
    // Check if user is already in queue
    const isInQueue = queue.members.some(member => 
      member.user.toString() === req.user.user.id && 
      ['waiting', 'current'].includes(member.status)
    );
    
    if (isInQueue) {
      return res.status(400).json({ message: 'You are already in this queue' });
    }
    
    // Add user to queue with project interest as notes
    await queue.addToQueue(req.user.user.id, projectInterest);
    
    // Get updated queue
    const updatedQueue = await Queue.findById(req.params.id)
      .populate('team', 'name description category location')
      .populate('members.user', 'name email');
    
    res.json(updatedQueue);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Queue not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/queues/:id/leave
// @desc    Leave a queue
// @access  Private
router.put('/:id/leave', verifyToken, async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);
    
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }
    
    // Find user in queue
    const memberIndex = queue.members.findIndex(member => 
      member.user.toString() === req.user.user.id && 
      ['waiting', 'current'].includes(member.status)
    );
    
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'You are not in this queue' });
    }
    
    // Update member status to cancelled
    queue.members[memberIndex].status = 'cancelled';
    await queue.save();
    
    // Get updated queue
    const updatedQueue = await Queue.findById(req.params.id)
      .populate('team', 'name description category location')
      .populate('members.user', 'name email');
    
    res.json(updatedQueue);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Queue not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/queues/:id/next
// @desc    Move to next person in queue
// @access  Private (Mentor/Admin only)
router.put('/:id/next', verifyToken, isMentorOrAdmin, async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id).populate('team');
    
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }
    
    // Check if user is the team mentor or an admin
    if (queue.team.mentor.toString() !== req.user.user.id && req.user.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to manage this queue' });
    }
    
    // Get next person in queue
    const nextPerson = queue.getNextInQueue();
    await queue.save();
    
    // Get updated queue
    const updatedQueue = await Queue.findById(req.params.id)
      .populate('team', 'name description category location')
      .populate('members.user', 'name email');
    
    res.json({
      queue: updatedQueue,
      nextPerson
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Queue not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
