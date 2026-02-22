import mongoose from 'mongoose';

const transportQuerySchema = new mongoose.Schema({
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
  queriedAt: {
    type: Date,
    default: Date.now,
  },
});

const TransportQuery = mongoose.model('TransportQuery', transportQuerySchema);
export default TransportQuery;
