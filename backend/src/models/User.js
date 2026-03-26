import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true // Explicit index for performance at scale
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    }
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    index: true // Crucial for social login scaling
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationOTP: {
    type: String,
    default: null
  },
  emailVerificationOTPExpiry: {
    type: Date,
    default: null
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  tier: {
    type: String,
    enum: ['Eco Newcomer', 'Green Scout', 'City Guardian', 'Eco Warrior', 'Urban Hero', 'Planet Saviour'],
    default: 'Eco Newcomer'
  },
  points: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number
  },
  badges: {
    type: [String],
    default: []
  },
  reportsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to hash password
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to recalculate tier based on points (Aligned with Frontend)
userSchema.methods.recalcTier = function () {
  if (this.points >= 3000) {
    this.tier = 'Planet Saviour';
  } else if (this.points >= 1500) {
    this.tier = 'Urban Hero';
  } else if (this.points >= 700) {
    this.tier = 'Eco Warrior';
  } else if (this.points >= 300) {
    this.tier = 'City Guardian';
  } else if (this.points >= 100) {
    this.tier = 'Green Scout';
  } else {
    this.tier = 'Eco Newcomer';
  }
};


// Update tier before saving if points changed
userSchema.pre('save', async function () {
  if (this.isModified('points')) {
    this.recalcTier();
  }
});

export default mongoose.model('User', userSchema);