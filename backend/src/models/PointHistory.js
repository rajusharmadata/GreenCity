import mongoose from 'mongoose';

const pointHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  delta: { type: Number, required: true },
  reason: { type: String, default: 'Action' },
  totalAfter: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

pointHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('PointHistory', pointHistorySchema);

