// filepath: c:\Users\omkar\Downloads\Github\Alumni\Server\index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./config/passport.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import User from "./Models/User.js";
import { uploadsDir } from "./utils/upload.js";
import { startScheduledCleanup } from "./utils/scheduler.js";
import debugRouter from "./routes/debug.js";
import alumniRouter from "./routes/alumni.js";
import userRouter from "./routes/user.js";
import jobRouter from "./routes/jobs.js";
import eventRouter from "./routes/events.js";
import adminRouter from "./routes/admin.js";
import settingsRouter from "./routes/settings.js";
import newsletterRouter from "./routes/newsletters.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default client URL for redirects and CORS
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const app = express();

// Serve uploaded files statically
app.use("/uploads", express.static(uploadsDir));

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Improved CORS configuration
const allowedOrigins = [
  CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "userId"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  }),
);

// Improved session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

// Global error handling middleware
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    console.error(
      `CORS Error: ${req.method} request from origin ${req.headers.origin} to ${req.originalUrl}`,
    );
  } else {
    console.error(err.stack);
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  })
  .then(async () => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.log(
      "Please check if your MongoDB connection string is correct and the database is accessible.",
    );
    process.exit(1);
  });

// CORS Test endpoint
app.get("/api/cors-test", (req, res) => {
  res.json({
    message: "CORS is working correctly!",
    origin: req.headers.origin || "No origin detected",
    credentials: "Credentials supported",
  });
});

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Auth Routes
app.get(
  "/auth/google",
  (req, res, next) => {
    console.log("Starting Google OAuth flow...");
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  }),
);

app.get(
  "/auth/google/callback",
  (req, res, next) => {
    console.log("Received callback from Google...");
    next();
  },
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/login?error=google_auth_failed`,
    session: false,
  }),
  async (req, res) => {
    try {
      console.log("Google authentication successful, generating token...");

      // Check if user exists
      let user = await User.findOne({ email: req.user.email });

      if (!user) {
        // Create new user if doesn't exist
        user = await User.create({
          email: req.user.email,
          name: req.user.displayName,
          isApproved: false,
          isAdmin: false,
        });
      }

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

      const redirectUrl = `${CLIENT_URL}/auth/callback?token=${token}`;
      console.log("Redirecting to:", redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Token generation error:", error);
      res.redirect(`${CLIENT_URL}/login?error=token_generation_failed`);
    }
  },
);

// Add a route to handle the frontend callback
app.get("/auth/callback", (req, res) => {
  const token = req.query.token;
  if (token) {
    res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
  } else {
    res.redirect(`${CLIENT_URL}/login?error=no_token`);
  }
});

// Mount routes
app.use("/api/debug", debugRouter);
app.use("/api/alumni", alumniRouter);
app.use("/api/user", userRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/events", eventRouter);
app.use("/api/admin", adminRouter);
app.use("/api/newsletters", newsletterRouter);
app.use("/api", settingsRouter);
app.get("/api/trigger-cleanup", async (req, res) => {
  console.log("Manual cleanup triggered");
  try {
    const { runOrphanedFileCleanup } = await import("./utils/fileCleanup.js");
    const results = await runOrphanedFileCleanup();
    res.status(200).json({
      message: "Cleanup completed",
      results: results,
    });
  } catch (error) {
    console.error("Error during manual cleanup:", error);
    res.status(500).json({
      message: "Cleanup failed",
      error: error.message,
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(
    `CORS configured to accept requests from: ${allowedOrigins.join(", ")}`,
  );

  // Start scheduled file cleanup
  startScheduledCleanup();
});

// Export the app for testing
export default app;
