import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  tier: {
    type: String,
    required: true,
    enum: ['Green Scout', 'Urban Ranger', 'Eco Guardian', 'City Champion', 'Eco Legend']
  },
  points: {
    type: Number,
    default: 0
  },
  reportsCount: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    required: true
  },
  previousRank: {
    type: Number,
    default: null
  },
  rankChange: {
    type: Number,
    default: 0
  },
  badges: {
    type: [String],
    default: []
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
leaderboardSchema.index({ rank: 1 });
leaderboardSchema.index({ points: -1 });
leaderboardSchema.index({ userId: 1 });
leaderboardSchema.index({ updatedAt: -1 });

// Update the updatedAt timestamp before saving
leaderboardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Leaderboard', leaderboardSchema);