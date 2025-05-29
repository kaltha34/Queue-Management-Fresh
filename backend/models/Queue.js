const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed'],
    default: 'active'
  },
  currentNumber: {
    type: Number,
    default: 0
  },
  estimatedTimePerPerson: {
    type: Number, // in minutes
    default: 15
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    queueNumber: Number,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'waiting', 'current', 'completed', 'cancelled', 'rejected'],
      default: 'pending'
    },
    notes: String,
    expertise: String,
    reason: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for estimated wait time
queueSchema.virtual('estimatedWaitTime').get(function() {
  const waitingMembers = this.members.filter(m => m.status === 'waiting');
  return waitingMembers.length * this.estimatedTimePerPerson;
});

// Method to add a user to the queue
queueSchema.methods.addToQueue = function(userId, projectInterest) {
  // Check if user is already in queue with waiting or current status
  const existingMember = this.members.find(member => 
    member.user.toString() === userId && 
    ['waiting', 'current'].includes(member.status)
  );
  
  if (existingMember) {
    throw new Error('User is already in this queue');
  }
  
  const nextNumber = this.currentNumber + 1;
  this.members.push({
    user: userId,
    queueNumber: nextNumber,
    status: 'waiting',
    notes: projectInterest || '',
    joinedAt: new Date()
  });
  this.currentNumber = nextNumber;
  return this.save();
};

// Method to get the next person in queue
queueSchema.methods.getNextInQueue = function() {
  // Find the current person and mark as completed
  const currentIndex = this.members.findIndex(m => m.status === 'current');
  if (currentIndex !== -1) {
    this.members[currentIndex].status = 'completed';
  }
  
  // Find the next waiting person
  const nextIndex = this.members.findIndex(m => m.status === 'waiting');
  if (nextIndex !== -1) {
    this.members[nextIndex].status = 'current';
    return this.members[nextIndex];
  }
  
  return null;
};

module.exports = mongoose.model('Queue', queueSchema);
