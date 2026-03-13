import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
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
    trim: true
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
    sparse: true
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
    enum: ['Green Scout', 'Urban Ranger', 'Eco Guardian', 'City Champion', 'Eco Legend'],
    default: 'Green Scout'
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

// Method to recalculate tier based on points
userSchema.methods.recalcTier = function () {
  if (this.points >= 10000) {
    this.tier = 'Eco Legend';
  } else if (this.points >= 6000) {
    this.tier = 'City Champion';
  } else if (this.points >= 3000) {
    this.tier = 'Eco Guardian';
  } else if (this.points >= 1000) {
    this.tier = 'Urban Ranger';
  } else {
    this.tier = 'Green Scout';
  }
};

// Update tier before saving if points changed
userSchema.pre('save', async function () {
  if (this.isModified('points')) {
    this.recalcTier();
  }
});

export default mongoose.model('User', userSchema);