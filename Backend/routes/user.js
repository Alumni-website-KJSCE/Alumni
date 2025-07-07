import express from "express";
import User from "../Models/User.js";
import Alumni from "../Models/Alumni.js";
import { authenticateToken, isAdmin } from "../middleware/auth.js";
import { upload, profileImagesDir } from "../utils/upload.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; // Handle both id formats
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  upload.fields([
    { name: "attendanceProof", maxCount: 1 },
    { name: "profilePicture", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const userId = req.user.id || req.user._id; // Handle both id formats

      console.log("Profile update request:", {
        body: req.body,
        files: req.files,
        user: userId,
      });

      // Get current user data to check for existing files
      const currentUser = await User.findById(userId).select("-password");
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      } // Collect updates from form data
      const updates = { ...req.body };

      // Convert councilMember to Boolean
      if (updates.councilMember !== undefined) {
        updates.councilMember =
          updates.councilMember === "true" || updates.councilMember === true;
      }

      // Handle councils data (multiple councils)
      if (updates.councils && typeof updates.councils === "string") {
        try {
          updates.councils = JSON.parse(updates.councils);
        } catch (e) {
          console.error("Error parsing councils data:", e);
          updates.councils = [];
        }
      }

      // Track old file paths for cleanup
      const oldProfilePicture = currentUser.profilePicture;
      const oldAttendanceProof = currentUser.attendanceProof;
      // Handle file paths
      if (req.files) {
        if (req.files["attendanceProof"]?.[0]) {
          updates.attendanceProof = `/uploads/${req.files["attendanceProof"][0].filename}`;
        }
        if (req.files["profilePicture"]?.[0]) {
          updates.profilePicture = `/uploads/profileImages/${req.files["profilePicture"][0].filename}`;
        }

        // Delete old files if they exist and new files are being uploaded
        if (updates.attendanceProof && oldAttendanceProof) {
          try {
            fs.unlinkSync(path.join(__dirname, "..", oldAttendanceProof));
          } catch (e) {
            console.error("Error deleting old attendance proof:", e);
          }
        }

        if (updates.profilePicture && oldProfilePicture) {
          try {
            fs.unlinkSync(path.join(__dirname, "..", oldProfilePicture));
          } catch (e) {
            console.error("Error deleting old profile picture:", e);
          }
        }
      }
      // Prevent updating admin status and approval status
      delete updates.isAdmin;
      delete updates.isApproved;

      // Handle councils data
      if (updates.councils && typeof updates.councils === "string") {
        try {
          updates.councils = JSON.parse(updates.councils);
        } catch (e) {
          console.error("Error parsing councils data:", e);
          updates.councils = [];
        }
      }

      // Parse otherSocialLinks if provided
      if (
        updates.otherSocialLinks &&
        typeof updates.otherSocialLinks === "string"
      ) {
        try {
          updates.otherSocialLinks = JSON.parse(updates.otherSocialLinks);
        } catch (e) {
          console.error("Error parsing otherSocialLinks:", e);
        }
      }

      if (updates.contributionInterest) {
        updates.contributionInterest = updates.contributionInterest;
      }
      if (updates.contributionDetails) {
        updates.contributionDetails = updates.contributionDetails;
      }
      if (updates.higherEducation) {
        updates.higherEducation = updates.higherEducation;
        updates.higherEducationInstitute = updates.higherEducationInstitute;
        updates.higherEducationYear = parseInt(updates.higherEducationYear, 10);
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true },
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Clean up old files if new ones were uploaded
      if (
        updates.profilePicture &&
        oldProfilePicture &&
        oldProfilePicture !== updates.profilePicture
      ) {
        try {
          const oldImagePath = path.join(__dirname, "..", oldProfilePicture);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log("Deleted old profile image:", oldProfilePicture);
          }
        } catch (deleteError) {
          console.error("Error deleting old profile image:", deleteError);
          // Don't fail the request if file deletion fails
        }
      }

      if (
        updates.attendanceProof &&
        oldAttendanceProof &&
        oldAttendanceProof !== updates.attendanceProof
      ) {
        try {
          const oldProofPath = path.join(__dirname, "..", oldAttendanceProof);
          if (fs.existsSync(oldProofPath)) {
            fs.unlinkSync(oldProofPath);
            console.log("Deleted old attendance proof:", oldAttendanceProof);
          }
        } catch (deleteError) {
          console.error("Error deleting old attendance proof:", deleteError);
          // Don't fail the request if file deletion fails
        }
      } // Sync profile image with Alumni collection if it was updated
      if (
        (updates.profilePicture ||
          updates.location ||
          updates.company ||
          updates.currentPosting) &&
        user._id
      ) {
        try {
          // First try to find by userId
          let alumniRecord = await Alumni.findOne({ userId: user._id });

          // If not found by userId, try by name as a fallback
          if (!alumniRecord) {
            alumniRecord = await Alumni.findOne({
              Name: {
                $regex: new RegExp(
                  "^" + user.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
                  "i",
                ),
              },
            });

            // If found by name, update the userId for future reference
            if (alumniRecord) {
              alumniRecord.userId = user._id;
              await alumniRecord.save();
              console.log("Updated Alumni record with userId:", user._id);
            }
          }

          // Update the alumni record fields if found
          if (alumniRecord) {
            if (updates.profilePicture) {
              alumniRecord.profileImage = updates.profilePicture;
            }

            if (updates.location) {
              alumniRecord.Location = updates.location;
            }

            if (updates.company) {
              alumniRecord.Company = updates.company;
            }

            if (updates.currentPosting) {
              alumniRecord.Designation = updates.currentPosting;
            }

            await alumniRecord.save();
            console.log("Alumni record synced for user:", user.name);
          }
        } catch (syncError) {
          console.error(
            "Error syncing data with Alumni collection:",
            syncError,
          );
          // Don't fail the request if alumni sync fails
        }
      } // Sync LinkedIn profile link with Alumni collection if it was updated
      if (
        (updates.linkedin ||
          updates.councilMember !== undefined ||
          updates.councils) &&
        user._id
      ) {
        try {
          // First try to find by userId
          let alumniRecord = await Alumni.findOne({ userId: user._id });

          // If not found by userId, try by name as a fallback
          if (!alumniRecord) {
            alumniRecord = await Alumni.findOne({
              Name: {
                $regex: new RegExp(
                  "^" + user.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
                  "i",
                ),
              },
            });

            // If found by name, update the userId for future reference
            if (alumniRecord) {
              alumniRecord.userId = user._id;
              await alumniRecord.save();
              console.log(
                "Updated Alumni record with userId for data sync:",
                user._id,
              );
            }
          }

          // Update the alumni record if found
          if (alumniRecord) {
            // Update LinkedIn
            if (updates.linkedin) {
              alumniRecord["LinkedIn Profile Link"] = updates.linkedin;
              alumniRecord.linkedinProfileLink = updates.linkedin;
            }

            // Update council data
            if (updates.councilMember !== undefined) {
              alumniRecord.councilMember = updates.councilMember;
            }

            if (updates.councils) {
              alumniRecord.councils = updates.councils;
            }

            await alumniRecord.save();
            console.log("Alumni record synced for user:", user.name);
          }
        } catch (syncError) {
          console.error(
            "Error syncing data with Alumni collection:",
            syncError,
          );
          // Don't fail the request if alumni sync fails
        }
      }

      res.json(user);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Check if user is authenticated
router.get("/check-auth", authenticateToken, (req, res) => {
  const userId = req.user.id || req.user._id; // Handle both id formats
  res.json({
    isAuthenticated: true,
    user: {
      id: userId,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
      isApproved: req.user.isApproved,
    },
  });
});

export default router;
