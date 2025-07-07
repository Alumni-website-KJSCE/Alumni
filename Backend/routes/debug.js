import express from "express";
import User from "../Models/User.js";
import Alumni from "../Models/Alumni.js";
import { authenticateToken, isAdmin } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Only allow these routes in development mode
router.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return res
      .status(404)
      .json({ message: "Debug routes not available in production" });
  }
  next();
});

// Get all users (for debugging)
router.get("/debug/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    console.error("Debug route error:", error);
    res.status(500).json({ message: "Server error", error: error.toString() });
  }
});

// Route to create an initial admin user
router.post("/create-admin", async (req, res) => {
  try {
    const { email, password, name, secretKey } = req.body;

    // Validate the secret key (an additional security measure)
    if (secretKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(401).json({ message: "Invalid setup key" });
    }

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but is not an admin, make them an admin
      if (!user.isAdmin) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.findByIdAndUpdate(
          user._id,
          {
            $set: {
              isAdmin: true,
              isApproved: true,
              password: hashedPassword,
              name: name,
            },
          },
          { new: true },
        ).select("-password");

        return res.status(200).json({
          message: "Existing user upgraded to admin",
          user,
        });
      } else {
        return res.status(400).json({ message: "Admin user already exists" });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin user
    user = new User({
      email,
      password: hashedPassword,
      name,
      isAdmin: true,
      isApproved: true,
    });

    await user.save();

    // Remove password from response
    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    res.status(201).json({
      message: "Admin user created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Debug route to check year distribution
router.get("/debug/years", async (req, res) => {
  try {
    // Get both raw data and schema info
    const sampleAlumni = await Alumni.find().limit(5);
    const schema = Alumni.schema.obj;
    const yearCounts = await Alumni.aggregate([
      {
        $group: {
          _id: "$Year of Passing",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);
    res.json({
      schema,
      sampleData: sampleAlumni,
      yearDistribution: yearCounts,
    });
  } catch (error) {
    console.error("Debug route error:", error);
    res.status(500).json({ message: "Server error", error: error.toString() });
  }
});

// Debug route with detailed alumni data analysis
router.get("/debug/alumni-years", async (req, res) => {
  try {
    const result = await Alumni.aggregate([
      {
        $group: {
          _id: "$Year of Passing",
          count: { $sum: 1 },
          samples: {
            $push: {
              name: "$Name",
              year: "$Year of Passing",
              branch: "$Branch",
              // Include the full document for inspection
              fullDoc: "$$ROOT",
            },
          },
        },
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          _id: 1,
          count: 1,
          yearValue: "$_id",
          samples: { $slice: ["$samples", 3] }, // Get 3 samples per year
        },
      },
    ]);

    // Also get raw data for verification
    const sampleRawDocs = await Alumni.find().limit(5);

    res.json({
      yearDistribution: result,
      sampleRawDocuments: sampleRawDocs,
    });
  } catch (error) {
    console.error("Debug route error:", error);
    res.status(500).json({ message: "Server error", error: error.toString() });
  }
});

// Access test route
router.get("/auth-test", authenticateToken, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

// Admin test route
router.get("/admin-test", authenticateToken, isAdmin, (req, res) => {
  res.json({
    message: "You have admin access",
    user: req.user,
  });
});

export default router;
