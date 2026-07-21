import Issue from '../../../models/Issue.js';
import User from '../../../models/User.js';
import Organization from '../../../models/Organization.js';
import IssueSolved from '../../../models/IssueSolved.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../middleware/errorMiddleware.js';

export const markIssueAsSolved = asyncHandler(async (req, res) => {
  const { issueCode, solvedBy, IssueSolved: isSolved } = req.body;

  if (!issueCode || !solvedBy) {
    throw new ApiError(400, 'issueCode and organizationId (solvedBy) are required');
  }

  // 1. Check if the issue exists
  const issue = await Issue.findOne({ issueCode }).populate('username');
  if (!issue) {
    throw new ApiError(404, 'Issue not found');
  }

  // 2. Check if the organization exists using organizationId (not _id)
  const organization = await Organization.findOne({ organizationId: solvedBy });
  if (!organization) {
    throw new ApiError(404, 'Organization not found');
  }

  // 3. Prevent duplicate solved entries
  const alreadySolved = await IssueSolved.findOne({ issueCode });
  if (alreadySolved) {
    throw new ApiError(400, 'Issue already marked as solved.');
  }

  // 4. Create a new IssueSolved entry
  const newIssueSolved = new IssueSolved({
    issueCode,
    title: issue.title,
    description: issue.description,
    location: issue.location,
    image: issue.image,
    solvedBy, // custom organizationId
    username: issue.username._id, // Reference to the user who posted the issue
    IssueSolved: typeof isSolved === 'boolean' ? isSolved : true
  });
  await newIssueSolved.save();

  // 5. Delete the issue from the Issue collection
  await Issue.deleteOne({ issueCode });

  // 6. Increment issuesolved count in organization
  await Organization.updateOne({ organizationId: solvedBy }, { $inc: { issuesolved: 1 } });

  // 7. Increment points in the User model
  await User.findByIdAndUpdate(issue.username._id, { $inc: { points: 50 } });

  res.status(200).json({
    success: true,
    message: 'Issue marked as solved, user rewarded, and issue deleted',
    data: { issueSolved: newIssueSolved }
  });
});
