import Issue from '../models/issue.js';
import User from '../models/auth.js';
import Organization from '../models/organization.js';
import IssueSolved from '../models/issuesolved.js';

export const markIssueAsSolved = async (req, res) => {
  try {
    const { issueCode, solvedBy, IssueSolved: isSolved } = req.body;

    if (!issueCode || !solvedBy) {
      return res.status(400).json({ message: 'issueCode and organizationId (solvedBy) are required' });
    }

    // 1. Check if the issue exists
    const issue = await Issue.findOne({ issueCode }).populate('username');
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // 2. Check if the organization exists using organizationId (not _id)
    const organization = await Organization.findOne({ organizationId: solvedBy });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // 3. Prevent duplicate solved entries
    const alreadySolved = await IssueSolved.findOne({ issueCode });
    if (alreadySolved) {
      return res.status(400).json({ message: 'Issue already marked as solved.' });
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
      message: 'Issue marked as solved, user rewarded, and issue deleted',
      issueSolved: newIssueSolved
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
