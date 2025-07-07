import express from "express";
import Job from "../Models/Job.js";
import { authenticateToken, isAdmin, isApproved } from "../middleware/auth.js";

const router = express.Router();

// Get all jobs (filtered by status for non-admins)
router.get("/", async (req, res) => {
  try {
    const { category, jobType, jobMode, page = 1, limit = 10 } = req.query;
    let query = {}; // Start with empty query

    // Apply filters if provided
    if (category) query.category = category;
    if (jobType) query.jobType = jobType;
    if (jobMode) query.jobMode = jobMode;

    // For non-admin users
    if (!req.user?.isAdmin) {
      // Show approved jobs and their own pending/rejected jobs
      if (req.user) {
        // If logged in, show all approved jobs plus their own jobs
        query.$or = [{ status: "approved" }, { postedBy: req.user.id }];
      } else {
        // If not logged in, only show approved jobs
        query.status = "approved";
      }
    } else if (req.query.status) {
      // For admins, allow filtering by status if provided
      query.status = req.query.status;
    }

    const totalJobs = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate("postedBy", "_id name email") // Include _id for ownership checks
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      jobs,
      totalPages: Math.ceil(totalJobs / limit),
      currentPage: parseInt(page),
      totalJobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get job by ID
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "postedBy",
      "_id name email",
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Only allow users to see:
    // 1. Approved jobs
    // 2. Their own jobs
    // 3. Any job if they are an admin
    if (
      job.status !== "approved" &&
      (!req.user ||
        (!req.user.isAdmin && job.postedBy._id.toString() !== req.user.id))
    ) {
      return res
        .status(403)
        .json({ message: "This job posting is not available" });
    }

    res.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Post a job (authenticated users only)
router.post("/", authenticateToken, isApproved, async (req, res) => {
  try {
    // Create job with current user as poster
    const job = await Job.create({
      ...req.body,
      postedBy: req.user.id,
      // Auto-approve if admin is posting
      status: req.user.isAdmin ? "approved" : "pending",
    });

    res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job posting:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Update job (owner or admin only)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if user is admin or job owner
    if (!req.user.isAdmin && job.postedBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this job" });
    }

    // If not admin and changing content, set back to pending
    const updatedStatus = req.body.status || job.status;
    if (
      !req.user.isAdmin &&
      (req.body.role !== job.role ||
        req.body.description !== job.description ||
        req.body.company !== job.company)
    ) {
      req.body.status = "pending";
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true },
    );

    res.json(updatedJob);
  } catch (error) {
    console.error("Error updating job:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Delete job (owner or admin only)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if user is admin or job owner
    if (!req.user.isAdmin && job.postedBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this job" });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin endpoints for job approval
router.put("/:id/approve", authenticateToken, isAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true },
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    console.error("Error approving job:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/reject", authenticateToken, isAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        rejectionComment:
          req.body.rejectionComment || "Your job posting was rejected",
      },
      { new: true },
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    console.error("Error rejecting job:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
