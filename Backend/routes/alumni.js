import express from "express";
import Alumni from "../Models/Alumni.js";
import { authenticateToken, isAdmin } from "../middleware/auth.js";
import { upload, profileImagesDir } from "../utils/upload.js";

const router = express.Router();

// Get all alumni
router.get("/", async (req, res) => {
  try {
    const { branch, year, search, company, designation, name } = req.query;

    console.log("Received query params:", req.query);

    const query = {};
    const conditions = [];

    // Name-specific search (only searches in Name field)
    if (name && name.trim() !== "") {
      const nameRegex = { $regex: name.trim(), $options: "i" };
      conditions.push({ Name: nameRegex });
    }

    // General search across multiple fields
    if (search && search.trim() !== "") {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      conditions.push({
        $or: [
          { Name: searchRegex },
          { Branch: searchRegex },
          { Company: searchRegex },
          { Designation: searchRegex },
          { Location: searchRegex },
        ],
      });
    }

    // Specific filters
    if (branch && branch.trim() !== "") {
      conditions.push({ Branch: { $regex: branch.trim(), $options: "i" } });
    }

    if (year && year.trim() !== "") {
      conditions.push({ "Year of Passing": parseInt(year) });
    }

    if (company && company.trim() !== "") {
      conditions.push({ Company: { $regex: company.trim(), $options: "i" } });
    }

    if (designation && designation.trim() !== "") {
      conditions.push({
        Designation: { $regex: designation.trim(), $options: "i" },
      });
    }
    // Combine all conditions with AND
    if (conditions.length > 0) {
      query.$and = conditions;
    }
    // If no search criteria, return all alumni

    console.log("MongoDB query:", JSON.stringify(query, null, 2));

    // Get all alumni matching the query without pagination
    const alumni = await Alumni.find(query)
      .sort({
        Name: 1,
        "Year of Passing": -1,
      })
      .collation({ locale: "en", strength: 1 }); // Case-insensitive sorting

    console.log(`Found ${alumni.length} alumni`);

    res.json({
      alumni,
      total: alumni.length,
    });
  } catch (error) {
    console.error("Error fetching alumni:", error);
    res.status(500).json({ message: "Server error", error: error.toString() });
  }
});

// Search alumni with advanced filters
router.get("/search", async (req, res) => {
  try {
    const { q, branch, year, company, designation, location } = req.query;

    console.log("Received search params:", req.query);

    const query = {};
    const conditions = [];

    // Build search query
    if (q && q.trim() !== "") {
      const searchRegex = { $regex: q.trim(), $options: "i" };
      conditions.push({
        $or: [
          { Name: searchRegex },
          { Branch: searchRegex },
          { Company: searchRegex },
          { Designation: searchRegex },
          { Location: searchRegex },
        ],
      });
    }

    // Apply specific filters
    if (branch && branch.trim() !== "") {
      conditions.push({ Branch: { $regex: branch.trim(), $options: "i" } });
    }

    if (year && year.trim() !== "") {
      conditions.push({ "Year of Passing": parseInt(year) });
    }

    if (company && company.trim() !== "") {
      conditions.push({ Company: { $regex: company.trim(), $options: "i" } });
    }

    if (designation && designation.trim() !== "") {
      conditions.push({
        Designation: { $regex: designation.trim(), $options: "i" },
      });
    }

    if (location && location.trim() !== "") {
      conditions.push({ Location: { $regex: location.trim(), $options: "i" } });
    }

    // Combine all conditions with AND
    if (conditions.length > 0) {
      query.$and = conditions;
    }

    console.log("MongoDB search query:", JSON.stringify(query, null, 2));

    // Get all alumni matching the search query
    const alumni = await Alumni.find(query)
      .sort({
        Name: 1,
        "Year of Passing": -1,
      })
      .collation({ locale: "en", strength: 1 }); // Case-insensitive sorting

    console.log(`Search found ${alumni.length} alumni`);

    res.json({
      alumni,
      total: alumni.length,
      query: req.query,
    });
  } catch (error) {
    console.error("Error searching alumni:", error);
    res.status(500).json({ message: "Server error", error: error.toString() });
  }
});

// Test endpoint to get all alumni (for debugging)
router.get("/all", async (req, res) => {
  try {
    const alumni = await Alumni.find({})
      .sort({
        Name: 1,
        "Year of Passing": -1,
      })
      .collation({ locale: "en", strength: 1 }); // Case-insensitive sorting

    console.log(`Test endpoint: Found ${alumni.length} total alumni`);
    res.json({
      alumni,
      total: alumni.length,
      message: "All alumni fetched successfully",
    });
  } catch (error) {
    console.error("Error in test endpoint:", error);
    res.status(500).json({ message: "Server error", error: error.toString() });
  }
});

// Get filter options for dropdowns
router.get("/filters", async (req, res) => {
  try {
    const [branches, years, companies, designations, locations] =
      await Promise.all([
        Alumni.distinct("Branch"),
        Alumni.distinct("Year of Passing"),
        Alumni.distinct("Company"),
        Alumni.distinct("Designation"),
        Alumni.distinct("Location"),
      ]);

    res.json({
      branches: branches.filter((b) => b && b !== "N/A").sort(),
      years: years.filter((y) => y).sort((a, b) => b - a),
      companies: companies.filter((c) => c && c !== "N/A").sort(),
      designations: designations.filter((d) => d && d !== "N/A").sort(),
      locations: locations.filter((l) => l && l !== "N/A").sort(),
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({ message: "Server error", error: error.toString() });
  }
});

// Get alumni by ID
router.get("/:id", async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) {
      return res.status(404).json({ message: "Alumni not found" });
    }
    res.json(alumni);
  } catch (error) {
    console.error("Error fetching alumni by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add new alumni (Admin only)
router.post(
  "/",
  authenticateToken,
  isAdmin,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const alumniData = { ...req.body };

      // Handle profile image if uploaded
      if (req.file) {
        alumniData.profileImage = `/uploads/profileImages/${req.file.filename}`;
      }

      // Convert year to number
      if (alumniData["Year of Passing"]) {
        alumniData["Year of Passing"] = parseInt(alumniData["Year of Passing"]);
      }

      // Set linkedinProfileLink field to match the LinkedIn Profile Link
      if (
        alumniData["LinkedIn Profile Link"] &&
        alumniData["LinkedIn Profile Link"] !== "N/A"
      ) {
        alumniData.linkedinProfileLink = alumniData["LinkedIn Profile Link"];
      }

      const alumni = await Alumni.create(alumniData);
      res.status(201).json(alumni);
    } catch (error) {
      console.error("Error creating alumni:", error);
      if (error.name === "ValidationError") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Update alumni (Admin only)
router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      // Get current alumni data to check for existing files
      const currentAlumni = await Alumni.findById(req.params.id);
      if (!currentAlumni) {
        return res.status(404).json({ message: "Alumni not found" });
      }

      const updates = { ...req.body };
      const oldProfileImage = currentAlumni.profileImage;

      // Handle profile image if uploaded
      if (req.file) {
        updates.profileImage = `/uploads/profileImages/${req.file.filename}`;
      }

      // Convert year to number
      if (updates["Year of Passing"]) {
        updates["Year of Passing"] = parseInt(updates["Year of Passing"]);
      }

      // Set linkedinProfileLink field to match the LinkedIn Profile Link
      if (
        updates["LinkedIn Profile Link"] &&
        updates["LinkedIn Profile Link"] !== "N/A"
      ) {
        updates.linkedinProfileLink = updates["LinkedIn Profile Link"];
      }

      const alumni = await Alumni.findByIdAndUpdate(req.params.id, updates, {
        new: true,
      });

      if (!alumni) {
        return res.status(404).json({ message: "Alumni not found" });
      }

      // Clean up old profile image if a new one was uploaded
      if (
        updates.profileImage &&
        oldProfileImage &&
        oldProfileImage !== updates.profileImage
      ) {
        try {
          const oldImagePath = path.join(__dirname, "..", oldProfileImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log("Deleted old alumni profile image:", oldProfileImage);
          }
        } catch (deleteError) {
          console.error(
            "Error deleting old alumni profile image:",
            deleteError,
          );
          // Don't fail the request if file deletion fails
        }
      }

      res.json(alumni);
    } catch (error) {
      console.error("Error updating alumni:", error);
      if (error.name === "ValidationError") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Delete alumni (Admin only)
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const alumni = await Alumni.findByIdAndDelete(req.params.id);

    if (!alumni) {
      return res.status(404).json({ message: "Alumni not found" });
    }

    res.json({ message: "Alumni deleted successfully" });
  } catch (error) {
    console.error("Error deleting alumni:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
