import mongoose from 'mongoose';

const transportSchema = new mongoose.Schema({
  route: {
    type: String,
    required: true,
    trim: true
  },
  from: {
    type: String,
    required: true,
    trim: true
  },
  to: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Electric Bus', 'Bike Share', 'Solar Tram', 'EV Shuttle', 'Solar Ferry']
  },
  frequency: {
    type: String,
    required: true,
    trim: true
  },
  carbonSaved: {
    type: Number,
    required: true,
    min: 0
  },
  distance: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 0
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
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
transportSchema.index({ type: 1 });
transportSchema.index({ isActive: 1 });
transportSchema.index({ createdAt: -1 });

export default mongoose.model('Transport', transportSchema);