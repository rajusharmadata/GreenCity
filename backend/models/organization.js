import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true
  },
  organizationId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: Number,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'organization'
  },
  transportTypes: {
    type: [String],
    enum: ['Bus', 'Train', 'Metro', 'SharedCab', 'Car', 'Bike', 'Other'],
    default: []
  },
  issuesolved:{
    type: Number,
    default: 0
  },
  // Email verification fields
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
  }
});

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization