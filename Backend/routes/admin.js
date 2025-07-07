import express from "express";
import User from "../Models/User.js";
import Alumni from "../Models/Alumni.js";
import Event from "../Models/Event.js";
import EventRegistration from "../Models/EventRegistration.js";
import Job from "../Models/Job.js";
import SiteSettings from "../Models/SiteSettings.js";
import { authenticateToken, isAdmin } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import {
  cleanupUserFiles,
  cleanupEventFiles,
  runOrphanedFileCleanup,
} from "../utils/fileCleanup.js";

dotenv.config();
const router = express.Router();

// Admin login route - this should NOT have authentication middleware
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if the user is an admin
    if (!user.isAdmin) {
      return res
        .status(403)
        .json({ message: "You do not have admin privileges" });
    }

    // If user doesn't have a password yet (e.g., OAuth-only user), return error
    if (!user.password) {
      return res
        .status(401)
        .json({ message: "No password set for this account" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create and sign JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        isApproved: user.isApproved,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Return token and user data (excluding password)
    const userData = { ...user.toObject() };
    delete userData.password;

    res.json({ token, user: userData });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// All routes below this line require admin authentication
router.use(authenticateToken, isAdmin);

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get pending users
router.get("/pending-users", async (req, res) => {
  try {
    const users = await User.find({ isApproved: false }).select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get events for admin
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Handle user approval
router.patch("/users/:id/approve", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          status: "approved", // Use status field for consistency
          isApproved: true,
          rejectionComment: null, // Clear any previous rejection comment
        },
      },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Alternative route for user approval that uses PUT instead of PATCH
router.put("/users/:id/approve", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          status: "approved", // Use status field for consistency
          isApproved: true,
          rejectionComment: null, // Clear any previous rejection comment
        },
      },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Handle user rejection
router.patch("/users/:id/reject", async (req, res) => {
  try {
    const userId = req.params.id;
    const { rejectionComment } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          isApproved: false,
          status: "rejected", // Use status field for consistency
          rejectionComment:
            rejectionComment || "Application rejected by administrator",
        },
      },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Alternative route for user rejection that uses PUT instead of PATCH
router.put("/users/:id/reject", async (req, res) => {
  try {
    const userId = req.params.id;
    const { rejectionComment } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          isApproved: false,
          status: "rejected",
          rejectionComment:
            rejectionComment || "Application rejected by administrator",
        },
      },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve a user
router.put("/approve-user/:id", async (req, res) => {
  try {
    // First get the user details before updating
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user approval status
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isApproved: true, status: "approved" } },
      { new: true },
    ).select("-password");

    // Create alumni entry when user is approved
    try {
      // Check if alumni entry already exists to avoid duplicates
      const existingAlumni = await Alumni.findOne({
        $or: [{ Name: user.name }, { "LinkedIn Profile Link": user.linkedin }],
      });

      if (!existingAlumni) {
        // Make sure Year of Passing is a number as per the Alumni schema
        const graduationYear = user.graduationYear
          ? parseInt(user.graduationYear, 10)
          : new Date().getFullYear();

        const alumniData = {
          Name: user.name || "N/A",
          Branch: user.branch || "N/A",
          "Year of Passing": graduationYear,
          Company: user.company || "N/A",
          Designation: user.jobTitle || "N/A",
          "LinkedIn Profile Link": user.linkedin || "N/A",
          Location: user.location || "N/A",
          profileImage: user.profilePicture || "",
        };

        const newAlumni = await Alumni.create(alumniData);
        console.log("Created alumni entry for approved user:", newAlumni);
      } else {
        console.log("Alumni entry already exists for user:", user.name);
      }
    } catch (alumniError) {
      console.error("Error creating alumni entry:", alumniError);
      // Don't fail the user approval if alumni creation fails
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject a user
router.put("/reject-user/:id", async (req, res) => {
  try {
    const { rejectionComment } = req.body;

    // Validate that rejectionComment is provided
    if (!rejectionComment || !rejectionComment.trim()) {
      return res.status(400).json({ message: "Rejection comment is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isApproved: false,
          rejectionComment: rejectionComment.trim(),
        },
      },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Make a user admin
router.put("/make-admin/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isAdmin: true } },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error making user admin:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove admin privileges
router.put("/remove-admin/:id", async (req, res) => {
  try {
    // Don't allow removing the last admin
    const adminCount = await User.countDocuments({ isAdmin: true });
    if (adminCount <= 1) {
      return res
        .status(400)
        .json({ message: "Cannot remove the last admin user" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isAdmin: false } },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error removing admin privileges:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const pendingUsersCount = await User.countDocuments({ isApproved: false });
    const alumniCount = await Alumni.countDocuments();
    const eventCount = await Event.countDocuments();
    const jobCount = await Job.countDocuments();
    const pendingJobsCount = await Job.countDocuments({ status: "pending" });

    res.json({
      userStats: {
        total: userCount,
        pending: pendingUsersCount,
        approved: userCount - pendingUsersCount,
      },
      alumniCount,
      eventCount,
      jobStats: {
        total: jobCount,
        pending: pendingJobsCount,
        approved: await Job.countDocuments({ status: "approved" }),
        rejected: await Job.countDocuments({ status: "rejected" }),
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to set or change admin password
router.put("/set-password", async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res
        .status(400)
        .json({ message: "User ID and new password are required" });
    }

    // Check if the user making the request is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin privileges required" });
    }

    // Only allow admin to change their own password or other admins' passwords
    if (userId !== req.user.id) {
      // Check if the target user is an admin
      const targetUser = await User.findById(userId);
      if (!targetUser || !targetUser.isAdmin) {
        return res
          .status(403)
          .json({ message: "You can only modify admin passwords" });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user already has a password, require current password
    if (user.password && req.user.id === userId) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user with new password
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { password: hashedPassword } },
      { new: true },
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    console.error("Error setting admin password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all jobs
router.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Event management endpoints
router.post("/events", async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/events/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findByIdAndUpdate(eventId, req.body, {
      new: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/events/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Clean up associated files before deleting from database
    try {
      await cleanupEventFiles(event);
      console.log("File cleanup: Event files cleaned up successfully");
    } catch (cleanupError) {
      console.error(
        "File cleanup: Error cleaning up event files:",
        cleanupError,
      );
      // Continue with deletion even if file cleanup fails
    }

    // Delete the event from database
    await Event.findByIdAndDelete(eventId);

    // Also delete all registrations for this event
    await EventRegistration.deleteMany({ event: eventId });

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get registrations for an event
router.get("/events/:id/registrations", async (req, res) => {
  try {
    const eventId = req.params.id;
    const registrations = await EventRegistration.find({ event: eventId });

    res.json(registrations);
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve a job
router.patch("/jobs/:jobId/approve", async (req, res) => {
  try {
    console.log("Approving job:", req.params.jobId);
    const job = await Job.findByIdAndUpdate(
      req.params.jobId,
      { status: "approved" },
      { new: true },
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job approved successfully", job });
  } catch (error) {
    console.error("Error approving job:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject a job
router.patch("/jobs/:jobId/reject", async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const { rejectionComment } = req.body;

    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          status: "rejected",
          rejectionComment: rejectionComment || "Job rejected by administrator",
        },
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

// Alternative PUT route for job rejection to match frontend
router.put("/jobs/:jobId/reject", async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const { rejectionComment } = req.body;

    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          status: "rejected",
          rejectionComment: rejectionComment || "Job rejected by administrator",
        },
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

// Alternative PUT route for job approval
router.put("/jobs/:jobId/approve", async (req, res) => {
  try {
    const jobId = req.params.jobId;

    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          status: "approved",
        },
      },
      { new: true },
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job); // Returns the updated job object
  } catch (error) {
    console.error("Error approving job:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Debug route to test alumni creation
router.post(
  "/test-alumni-creation",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Get user details
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if alumni entry already exists
      const existingAlumni = await Alumni.findOne({
        $or: [{ Name: user.name }, { "LinkedIn Profile Link": user.linkedin }],
      });

      if (existingAlumni) {
        return res.json({
          message: "Alumni entry already exists",
          alumniEntry: existingAlumni,
        });
      }

      // Create new alumni entry
      const graduationYear = user.graduationYear
        ? parseInt(user.graduationYear, 10)
        : new Date().getFullYear();

      const alumniData = {
        Name: user.name || "N/A",
        Branch: user.branch || "N/A",
        "Year of Passing": graduationYear,
        Company: user.company || "N/A",
        Designation: user.jobTitle || "N/A",
        "LinkedIn Profile Link": user.linkedin || "N/A",
        Location: user.location || "N/A",
        profileImage: user.profilePicture || "",
      };

      const newAlumni = await Alumni.create(alumniData);

      res.json({
        message: "Alumni entry created successfully",
        alumniEntry: newAlumni,
        userData: {
          id: user._id,
          name: user.name,
          email: user.email,
          course: user.branch,
          graduationYear: user.graduationYear,
        },
      });
    } catch (error) {
      console.error("Error in test alumni creation:", error);
      res
        .status(500)
        .json({ message: "Server error", error: error.toString() });
    }
  },
);

// Debug route to list all alumni
router.get("/list-all-alumni", authenticateToken, isAdmin, async (req, res) => {
  try {
    const alumni = await Alumni.find({});
    res.json({
      count: alumni.length,
      alumni,
    });
  } catch (error) {
    console.error("Error listing alumni:", error);
    res.status(500).json({ message: "Server error", error: error.toString() });
  }
});

// Sync approved users to alumni directory
router.post("/sync-alumni", authenticateToken, isAdmin, async (req, res) => {
  try {
    // Get all approved users
    const approvedUsers = await User.find({ isApproved: true });

    let syncedCount = 0;
    let skippedCount = 0;
    const errors = [];

    // Process each approved user
    for (const user of approvedUsers) {
      try {
        // Check if alumni entry already exists
        const existingAlumni = await Alumni.findOne({
          $or: [
            {
              Name: user.name,
              "Year of Passing": parseInt(user.graduationYear, 10),
            },
            { "LinkedIn Profile Link": user.linkedin },
          ],
        });

        if (existingAlumni) {
          // Update existing alumni entry with latest user data
          existingAlumni.Name = user.name || existingAlumni.Name;
          existingAlumni.Branch = user.branch || existingAlumni.Branch;
          existingAlumni["Year of Passing"] =
            parseInt(user.graduationYear, 10) ||
            existingAlumni["Year of Passing"];
          existingAlumni.Company = user.company || existingAlumni.Company;
          existingAlumni.Designation =
            user.jobTitle || existingAlumni.Designation;
          existingAlumni["LinkedIn Profile Link"] =
            user.linkedin || existingAlumni["LinkedIn Profile Link"];
          existingAlumni.Location = user.location || existingAlumni.Location;
          existingAlumni.profileImage =
            user.profilePicture || existingAlumni.profileImage;
          existingAlumni.councilMember =
            user.councilMember || existingAlumni.councilMember;
          existingAlumni.councils = user.councils || existingAlumni.councils;

          await existingAlumni.save();
          skippedCount++;
        } else {
          // Create new alumni entry
          const graduationYear = user.graduationYear
            ? parseInt(user.graduationYear, 10)
            : new Date().getFullYear();

          const alumniData = {
            Name: user.name || "N/A",
            Branch: user.branch || "N/A",
            "Year of Passing": graduationYear,
            Company: user.company || "N/A",
            Designation: user.jobTitle || "N/A",
            "LinkedIn Profile Link": user.linkedin || "N/A",
            Location: user.location || "N/A",
            profileImage: user.profilePicture || "",
            councilMember: user.councilMember || false,
            councils: user.councils || [],
          };

          await Alumni.create(alumniData);
          syncedCount++;
        }
      } catch (userError) {
        console.error(`Error processing user ${user._id}:`, userError);
        errors.push({
          userId: user._id,
          userName: user.name,
          error: userError.message,
        });
      }
    }

    res.json({
      syncedCount,
      skippedCount,
      errors,
      message: `Sync completed. ${syncedCount} new entries created, ${skippedCount} entries updated.`,
    });
  } catch (error) {
    console.error("Error syncing alumni directory:", error);
    res.status(500).json({
      message: "Failed to sync alumni directory",
      error: error.toString(),
    });
  }
});

// Delete a user (Admin only)
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user.id || userId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deletion of other admin users
    if (user.isAdmin) {
      return res.status(400).json({ message: "Cannot delete admin users" });
    }

    // Clean up associated files before deleting from database
    try {
      await cleanupUserFiles(user);
      console.log("File cleanup: User files cleaned up successfully");
    } catch (cleanupError) {
      console.error(
        "File cleanup: Error cleaning up user files:",
        cleanupError,
      );
      // Continue with deletion even if file cleanup fails
    }

    // Delete the user from database
    await User.findByIdAndDelete(userId);

    // Also delete associated alumni record if it exists
    try {
      await Alumni.deleteOne({ userId: userId });
      console.log("Admin: Associated alumni record deleted");
    } catch (alumniError) {
      console.error("Admin: Error deleting alumni record:", alumniError);
      // Continue as alumni record might not exist
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Manual file cleanup endpoint (Admin only)
router.post("/cleanup/orphaned-files", async (req, res) => {
  try {
    const results = await runOrphanedFileCleanup();

    if (results.success) {
      res.json({
        message: "Orphaned file cleanup completed successfully",
        totalDeleted: results.totalDeleted,
        details: results.details,
      });
    } else {
      res.status(500).json({
        message: "Orphaned file cleanup completed with errors",
        totalDeleted: results.totalDeleted,
        totalErrors: results.totalErrors,
        details: results.details,
        error: results.error,
      });
    }
  } catch (error) {
    console.error("Error running orphaned file cleanup:", error);
    res.status(500).json({
      message: "Failed to run orphaned file cleanup",
      error: error.message,
    });
  }
});

// Get file cleanup status/report (Admin only)
router.get("/cleanup/status", async (req, res) => {
  try {
    // This is a dry run to show what would be cleaned up

    // Get all active file references
    const [users, events, siteSettings] = await Promise.all([
      User.find({}, "profilePicture").lean(),
      Event.find({}, "imageUrl").lean(),
      SiteSettings.findOne({}, "galleryImages").lean(),
    ]);

    // Count files and active references
    const stats = {
      profileImages: {
        totalFiles: 0,
        activeReferences: users.filter((u) => u.profilePicture).length,
        orphanedFiles: 0,
      },
      eventImages: {
        totalFiles: 0,
        activeReferences: events.filter((e) => e.imageUrl).length,
        orphanedFiles: 0,
      },
      galleryImages: {
        totalFiles: 0,
        activeReferences: siteSettings?.galleryImages?.length || 0,
        orphanedFiles: 0,
      },
    };

    // Count actual files in directories
    const uploadsDir = path.join(process.cwd(), "uploads");

    const directories = ["profileImages", "eventImages", "galleryImages"];

    for (const dir of directories) {
      const dirPath = path.join(uploadsDir, dir);
      try {
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath);
          stats[dir].totalFiles = files.length;
          stats[dir].orphanedFiles = Math.max(
            0,
            files.length - stats[dir].activeReferences,
          );
        }
      } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
      }
    }

    res.json({
      message: "File cleanup status report",
      stats,
      totalOrphanedFiles: Object.values(stats).reduce(
        (sum, stat) => sum + stat.orphanedFiles,
        0,
      ),
    });
  } catch (error) {
    console.error("Error getting cleanup status:", error);
    res.status(500).json({
      message: "Failed to get cleanup status",
      error: error.message,
    });
  }
});

export default router;
