import mongoose from 'mongoose';

const ecoRouteHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mode: {
    type: String,
    enum: ['walk', 'cycle', 'transit', 'drive'],
    required: true,
    index: true
  },
  from: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  to: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  distanceKm: { type: Number, required: true, min: 0 },
  durationMin: { type: Number, required: true, min: 0 },
  co2SavedKg: { type: Number, required: true },
  ecoScore: { type: Number, required: true, min: 0, max: 100 },
  createdAt: { type: Date, default: Date.now, index: true }
});

ecoRouteHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('EcoRouteHistory', ecoRouteHistorySchema);

