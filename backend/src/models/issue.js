import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  issueCode: {
    type: String,
    unique: true,
    sparse: false,
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 80,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Waste',
      'Infrastructure',
      'Road Hazard',
      'Vandalism',
      'Air Quality',
      'Water',
      'Noise',
      'Other',
    ],
  },
  description: {
    type: String,
    required: true,
    maxlength: 300,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  coords: {
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
  },
  image: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending',
  },
  integrity: {
    type: Number,
    default: 10,
    min: 0,
    max: 100,
  },
  // AI analysis metadata (Gemini)
  ai: {
    category: { type: String, default: '' },
    severity: {
      type: String,
      enum: ['', 'Low', 'Medium', 'High', 'Critical'],
      default: ''
    },
    description: { type: String, default: '' },
    suggestedAction: { type: String, default: '' },
    isEnvironmentalIssue: { type: Boolean, default: false },
    confidence: { type: Number, default: null, min: 0, max: 1 },
    model: { type: String, default: '' },
    analyzedAt: { type: Date, default: null },
    raw: { type: mongoose.Schema.Types.Mixed, default: null }
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  upvotedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ── Indexes ───────────────────────────────────────────────────────────────────
issueSchema.index({ issueCode: 1 }, { unique: true });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ status: 1 });
issueSchema.index({ category: 1 });
issueSchema.index({ userId: 1 });
issueSchema.index({ 'coords.lat': 1, 'coords.lng': 1 });

// ── Hook 1: Auto-generate issueCode before validation ─────────────────────────
// ✅ async function — NO next param, NO next() call
issueSchema.pre('validate', async function () {
  if (!this.issueCode) {
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const ts   = Date.now().toString(36).toUpperCase();
    this.issueCode = `ISS-${ts}-${rand}`;
  }
});

// ── Hook 2: Auto-update updatedAt before save ─────────────────────────────────
// ✅ async regular function — NO next param, NO next() call
issueSchema.pre('save', async function () {
  this.updatedAt = new Date();
});

export default mongoose.model('Issue', issueSchema);
