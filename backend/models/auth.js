import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: function() { return !this.authProvider || this.authProvider.includes('local'); }
  },
  lastName: {
    type: String,
    required: function() { return !this.authProvider || this.authProvider.includes('local'); }
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() { return !this.authProvider || this.authProvider.includes('local'); }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  issuecount:{
    type: Number,
    default: 0
  },
  points:{
    type: Number,
    default: 0
  },
  // OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  profilePicture: {
    type: String
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationTokenExpiry: {
    type: Date,
    default: null
  },
  // OTP fields for email verification
  emailVerificationOTP: {
    type: String,
    default: null
  },
  emailVerificationOTPExpiry: {
    type: Date,
    default: null
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  otpLastAttempt: {
    type: Date,
    default: null
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'github', 'google,github', 'github,google'],
    default: 'local'
  }
});

const User = mongoose.model('User', userSchema);
export default User;