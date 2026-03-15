import Issue from '../models/issue.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs/promises';
import { analyzeIssueImage } from './aiAnalysis.js';
import { addPoints } from './pointsService.js';

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_ISSUE_FOLDER || 'greencity_issues';
const POINTS_REPORT = 10;
const POINTS_REASON = 'Issue report (AI)';

const SEVERITY_TO_INTEGRITY = {
  Critical: 90,
  High: 70,
  Medium: 45,
  Low: 20,
};

function severityToIntegrity(severity) {
  return SEVERITY_TO_INTEGRITY[severity] ?? 10;
}

/**
 * Submit a report: analyze image, upload, create issue, award points.
 * Returns { report, pointsEarned, totalPoints, ai }.
 */
export async function submitReportLogic(userId, { filePath, lat, lng, address }) {
  const ai = await analyzeIssueImage(filePath);
  let imageUrl = '';
  try {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: CLOUDINARY_FOLDER,
        resource_type: 'image',
      });
      imageUrl = result.secure_url;
    } catch (err) {
      // Cloudinary failure should not prevent report creation.
      console.error('[reportService] cloudinary upload error:', err?.message ?? err);
      imageUrl = '';
    }
  } finally {
    if (filePath) {
      await fs.unlink(filePath).catch(() => {});
    }
  }

  const coords = lat != null && lng != null ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;
  const title = `${ai.category} (${ai.severity})`;
  const issue = new Issue({
    title,
    category: ai.category,
    description: (ai.description || 'AI could not produce a description for this report.').slice(0, 300),
    address: address || 'Unknown',
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
      raw: ai.raw,
    },
  });
  await issue.save();

  // Reports and points should never break the request; log but keep response safe.
  let pointsResult = null;
  try {
    await User.findByIdAndUpdate(userId, { $inc: { reportsCount: 1 } });
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      // Non‑fatal: user reportsCount is only for stats.
      console.error('[reportService] reportsCount increment error:', e?.message ?? e);
    }
  }
  try {
    pointsResult = await addPoints(userId, POINTS_REPORT, POINTS_REASON);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[reportService] addPoints error:', e?.message ?? e);
    }
    pointsResult = null;
  }

  return {
    report: issue,
    pointsEarned: POINTS_REPORT,
    totalPoints: pointsResult?.newPoints ?? undefined,
    ai: {
      category: ai.category,
      severity: ai.severity,
      description: ai.description,
      suggestedAction: ai.suggestedAction,
      isEnvironmentalIssue: ai.isEnvironmentalIssue,
      confidence: ai.confidence,
    },
  };
}

/**
 * Fetch reports for a user.
 */
export async function myReportsLogic(userId) {
  const reports = await Issue.find({ userId }).sort({ createdAt: -1 }).lean();
  return { reports };
}

export default { submitReportLogic, myReportsLogic };
