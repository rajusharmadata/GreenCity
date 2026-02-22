import mongoose from "mongoose";

const issueSolvedSchema = new mongoose.Schema({
    username: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issueCode: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  solvedBy: {
    type: String, // Referencing organizationId (string), not ObjectId
    required: true
  },
  solvedAt: {
    type: Date,
    default: Date.now
  },
  IssueSolved: {
    type: Boolean,
    default: false
  }
});

const IssueSolved = mongoose.model('IssueSolved', issueSolvedSchema);
export default IssueSolved;
