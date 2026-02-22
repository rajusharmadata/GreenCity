import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 80,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Waste', 'Infrastructure', 'Road Hazard', 'Vandalism', 'Air Quality', 'Water', 'Noise', 'Other']
  },
  description: {
    type: String,
    required: true,
    maxlength: 300,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  coords: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  integrity: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  },
  upvotes: {
    type: Number,
    default: 0
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
issueSchema.index({ createdAt: -1 });
issueSchema.index({ status: 1 });
issueSchema.index({ category: 1 });
issueSchema.index({ userId: 1 });

export default mongoose.model('Issue', issueSchema);