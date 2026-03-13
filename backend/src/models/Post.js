import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 }
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    imageUrl: { type: String, default: '' },
    filterTag: {
      type: String,
      enum: ['all', 'near', 'eco-tips', 'reports', 'events'],
      default: 'all',
      index: true
    },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: '' }
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: { type: [commentSchema], default: [] }
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ filterTag: 1, createdAt: -1 });

export default mongoose.model('Post', postSchema);

