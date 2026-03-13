import Issue from '../models/issue.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs/promises';
import { analyzeIssueImage, reverseGeocode } from '../services/aiAnalysis.js';
import { addPoints } from './leaderboardController.js';

const severityToIntegrity = (severity) => {
  switch (severity) {
    case 'Critical':
      return 90;
    case 'High':
      return 70;
    case 'Medium':
      return 45;
    case 'Low':
      return 20;
    default:
      return 10;
  }
};

/**
 * POST /api/reports/submit
 * Multipart: image
 * Body: lat?, lng?, address?
 * Creates an Issue using AI analysis. No manual title/description required.
 */
export const submitReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const lat = req.body.lat || req.body['coords[lat]'];
    const lng = req.body.lng || req.body['coords[lng]'];
    const address = (req.body.address || '').trim();

    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Upload to Cloudinary
    let imageUrl = '';
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: process.env.CLOUDINARY_ISSUE_FOLDER || 'greencity_issues',
        resource_type: 'image'
      });
      imageUrl = result.secure_url;
    } finally {
      if (req.file?.path) {
        await fs.unlink(req.file.path).catch(() => {});
      }
    }

    // AI analysis
    const ai = await analyzeIssueImage(imageUrl);

    // Reverse geocode if address is missing
    let resolvedAddress = address;
    if (!resolvedAddress && lat && lng) {
      console.log(`[Geocoding] Fetching address for ${lat}, ${lng}...`);
      resolvedAddress = await reverseGeocode(lat, lng);
      console.log(`[Geocoding] Resolved to: ${resolvedAddress}`);
    }

    const coords =
      lat && lng
        ? {
            lat: parseFloat(lat),
            lng: parseFloat(lng)
          }
        : undefined;

    const title = `${ai.category} (${ai.severity})`;

    const issue = new Issue({
      title,
      category: ai.category,
      description: ai.description || 'AI could not produce a description for this report.',
      address: resolvedAddress || 'Unknown',
      ...(coords ? { coords } : {}),
      image: imageUrl,
      status: 'Pending',
      integrity: severityToIntegrity(ai.severity),
      userId,
      ai: {
        category: ai.category,
        severity: ai.severity,
        description: ai.description,
        suggestedAction: ai.suggestedAction,
        isEnvironmentalIssue: ai.isEnvironmentalIssue,
        confidence: ai.confidence,
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        analyzedAt: new Date(),
        raw: ai.raw
      }
    });

    await issue.save();

    // Award points for report (mega-spec: 10)
    await User.findByIdAndUpdate(userId, { $inc: { reportsCount: 1 } });
    const pointsEarned = 10;
    const pointsResult = await addPoints(userId, pointsEarned, 'Issue report (AI)');

    return res.status(201).json({
      report: issue,
      pointsEarned,
      totalPoints: pointsResult?.newPoints ?? undefined,
      ai: {
        category: ai.category,
        severity: ai.severity,
        description: ai.description,
        suggestedAction: ai.suggestedAction,
        isEnvironmentalIssue: ai.isEnvironmentalIssue,
        confidence: ai.confidence
      }
    });
  } catch (error) {
    console.error('submitReport error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

export const myReports = async (req, res) => {
  try {
    const userId = req.user.userId;
    const reports = await Issue.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json({ reports });
  } catch (error) {
    console.error('myReports error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReportById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const report = await Issue.findOne({ _id: req.params.id, userId }).lean();
    if (!report) return res.status(404).json({ error: 'Report not found' });
    return res.json({ report });
  } catch (error) {
    console.error('getReportById error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default { submitReport, myReports, getReportById };

