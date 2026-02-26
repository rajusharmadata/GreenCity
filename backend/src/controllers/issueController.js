// ============================================================
// FILE 1: backend/controllers/issueController.js
// FIX: coords ab FormData se flat lat/lng accept karega
// ============================================================

import Issue from "../models/issue.js";
import User from "../models/User.js";
import path from "path";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import { addPoints } from "./leaderboardController.js";

export const createIssue = async (req, res) => {
  try {
    const { title, category, description, address } = req.body;

    // ✅ FIX: Frontend FormData mein lat/lng alag bhejta hai, coords object nahi
    const lat = req.body.lat || req.body["coords[lat]"];
    const lng = req.body.lng || req.body["coords[lng]"];

    const userId = req.user.userId;

    // Validation
    if (!title || !category || !description || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // coords optional hai — location permission deny ho sakti hai
    let coords = null;
    if (lat && lng) {
      coords = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      };
    }

    // Validate category
    const validCategories = [
      "Waste",
      "Infrastructure",
      "Road Hazard",
      "Vandalism",
      "Air Quality",
      "Water",
      "Noise",
      "Other"
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Handle image upload (Cloudinary)
    let imageUrl = "";
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: process.env.CLOUDINARY_ISSUE_FOLDER || "greencity_issues",
          resource_type: "image"
        });
        imageUrl = result.secure_url;
      } finally {
        try { if (req.file?.path) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path); } catch {}
      }
    }

    // Create issue
    const issue = new Issue({
      title: title.trim(),
      category,
      description: description.trim(),
      address: address.trim(),
      ...(coords && { coords }), // only add if coords exist
      image: imageUrl,
      userId
    });

    await issue.save();

    // Award +50 points + increment reportsCount and update leaderboard
    await User.findByIdAndUpdate(userId, { $inc: { reportsCount: 1 } });
    await addPoints(userId, 50, "Issue report");

    // Populate user data for response
    await issue.populate("userId", "name email avatar tier");

    return res.status(201).json({
      message: "Issue reported successfully",
      issue: {
        _id: issue._id,
        title: issue.title,
        category: issue.category,
        description: issue.description,
        address: issue.address,
        coords: issue.coords,
        image: issue.image,
        status: issue.status,
        integrity: issue.integrity,
        upvotes: issue.upvotes,
        userId: issue.userId,
        createdAt: issue.createdAt
      }
    });
  } catch (error) {
    console.error("Create issue error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get all issues
export const getIssues = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      userId,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const issues = await Issue.find(filter)
      .populate("userId", "name email avatar tier")
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .exec();

    const total = await Issue.countDocuments(filter);

    return res.json({
      issues,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error("Get issues error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get single issue
export const getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("userId", "name email avatar tier")
      .exec();

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    return res.json({ issue });
  } catch (error) {
    console.error("Get issue error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update issue status
export const updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ["Pending", "In Progress", "Resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("userId", "name email avatar");

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    return res.json({ message: "Status updated", issue });
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Upvote issue
export const upvoteIssue = async (req, res) => {
  try {
    const userId = req.user.userId;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const alreadyUpvoted = issue.upvotedBy.includes(userId);

    if (alreadyUpvoted) {
      issue.upvotedBy.pull(userId);
      issue.upvotes = Math.max(0, issue.upvotes - 1);
    } else {
      issue.upvotedBy.push(userId);
      issue.upvotes += 1;
    }

    await issue.save();

    const pointChange = alreadyUpvoted ? -5 : 5;
    await addPoints(issue.userId, pointChange, "Issue upvote");

    return res.json({
      message: alreadyUpvoted ? "Upvote removed" : "Upvoted successfully",
      upvotes: issue.upvotes,
      upvoted: !alreadyUpvoted
    });
  } catch (error) {
    console.error("Upvote error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete issue
export const deleteIssue = async (req, res) => {
  try {
    const userId = req.user.userId;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    if (issue.userId.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete image file if exists
    if (issue.image) {
      const imagePath = path.join(process.cwd(), "src", issue.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Issue.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(issue.userId, { $inc: { reportsCount: -1 } });

    return res.json({ message: "Issue deleted successfully" });
  } catch (error) {
    console.error("Delete issue error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  createIssue,
  getIssues,
  getIssue,
  updateIssueStatus,
  upvoteIssue,
  deleteIssue
};
