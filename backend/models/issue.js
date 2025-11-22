import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
    username: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String, required: true },
    issueCode: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
  });

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;