import mongoose from 'mongoose';

const transportEntrySchema = new mongoose.Schema({
  agencyName: {
    type: String,
    required: true,
    trim: true,
  },
  transportType: {
    type: String,
    enum: ['Bus', 'Train', 'Metro', 'SharedCab', 'Other'],
    required: true,
  },
  from: {
    type: String,
    required: true,
    trim: true,
  },
  to: {
    type: String,
    required: true,
    trim: true,
  },
  departureTimes: {
    type: [String],
    validate: {
      validator: (val) => Array.isArray(val) && val.length > 0,
      message: 'departureTimes must be a non-empty array',
    },
    required: true,
  },
  frequency: {
    type: String,
    default: 'Not specified',
  },
  fare: {
    type: Number,
    required: true,
  },
  contactInfo: {
    type: String,
    default: 'Not provided',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TransportEntry = mongoose.model('TransportEntry', transportEntrySchema);
export default TransportEntry;
