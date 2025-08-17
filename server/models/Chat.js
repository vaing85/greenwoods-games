const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    index: true
  },
  roomType: {
    type: String,
    enum: ['poker', 'general', 'private', 'tournament'],
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'system', 'emote', 'action'],
    default: 'text'
  },
  metadata: {
    action: String, // For system messages like 'player joined', 'player folded'
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number, // For betting actions
    cards: [String] // For showdown messages
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      enum: ['👍', '👎', '😂', '😮', '❤️', '😡']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Chat room schema for managing chat rooms
const chatRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['poker', 'general', 'private', 'tournament'],
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['player', 'observer', 'moderator', 'admin'],
      default: 'player'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    muteUntil: Date
  }],
  settings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    allowGuestMessages: {
      type: Boolean,
      default: false
    },
    moderationEnabled: {
      type: Boolean,
      default: true
    },
    maxParticipants: {
      type: Number,
      default: 100
    },
    messageRetentionDays: {
      type: Number,
      default: 30
    }
  },
  statistics: {
    totalMessages: {
      type: Number,
      default: 0
    },
    activeUsers: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
chatMessageSchema.index({ room: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1 });
chatMessageSchema.index({ createdAt: 1 }); // For TTL cleanup

chatRoomSchema.index({ type: 1, isActive: 1 });
chatRoomSchema.index({ 'participants.user': 1 });

// Methods for ChatMessage
chatMessageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji: emoji
  });
  
  return this.save();
};

chatMessageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  return this.save();
};

// Methods for ChatRoom
chatRoomSchema.methods.addParticipant = function(userId, role = 'player') {
  const existingParticipant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (existingParticipant) {
    existingParticipant.lastSeen = new Date();
    existingParticipant.role = role;
  } else {
    if (this.participants.length >= this.settings.maxParticipants) {
      throw new Error('Chat room is full');
    }
    
    this.participants.push({
      user: userId,
      role: role
    });
  }
  
  this.statistics.activeUsers = this.participants.filter(
    p => new Date() - p.lastSeen < 5 * 60 * 1000 // Active within last 5 minutes
  ).length;
  
  return this.save();
};

chatRoomSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    p => p.user.toString() !== userId.toString()
  );
  
  this.statistics.activeUsers = this.participants.filter(
    p => new Date() - p.lastSeen < 5 * 60 * 1000
  ).length;
  
  return this.save();
};

chatRoomSchema.methods.muteParticipant = function(userId, duration) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.isMuted = true;
    if (duration) {
      participant.muteUntil = new Date(Date.now() + duration * 1000);
    }
  }
  
  return this.save();
};

chatRoomSchema.methods.unmuteParticipant = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.isMuted = false;
    participant.muteUntil = undefined;
  }
  
  return this.save();
};

// Static methods
chatMessageSchema.statics.getRecentMessages = function(roomId, limit = 50) {
  return this.find({ 
    room: roomId, 
    isDeleted: false 
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('sender', 'username profile.displayName profile.avatar')
  .populate('metadata.targetUser', 'username profile.displayName');
};

chatMessageSchema.statics.createSystemMessage = function(roomId, action, metadata = {}) {
  return this.create({
    room: roomId,
    roomType: 'poker',
    sender: null, // System message
    message: this.formatSystemMessage(action, metadata),
    messageType: 'system',
    metadata: {
      action: action,
      ...metadata
    }
  });
};

chatMessageSchema.statics.formatSystemMessage = function(action, metadata) {
  const messages = {
    'player_joined': `${metadata.username} joined the table`,
    'player_left': `${metadata.username} left the table`,
    'game_started': 'New hand started',
    'player_folded': `${metadata.username} folded`,
    'player_called': `${metadata.username} called ${metadata.amount}`,
    'player_raised': `${metadata.username} raised to ${metadata.amount}`,
    'player_all_in': `${metadata.username} went all-in with ${metadata.amount}`,
    'showdown': `${metadata.username} shows ${metadata.cards.join(', ')}`,
    'hand_winner': `${metadata.username} wins ${metadata.amount} with ${metadata.hand}`
  };
  
  return messages[action] || `Game action: ${action}`;
};

// TTL index to automatically delete old messages
chatMessageSchema.index(
  { createdAt: 1 }, 
  { expireAfterSeconds: 30 * 24 * 60 * 60 } // 30 days
);

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = { ChatMessage, ChatRoom };
