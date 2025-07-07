import express from "express";
import Event from "../Models/Event.js";
import EventRegistration from "../Models/EventRegistration.js";
import { authenticateToken, isAdmin } from "../middleware/auth.js";
import { upload, eventImagesDir } from "../utils/upload.js";
import { cleanupEventFiles } from "../utils/fileCleanup.js";

const router = express.Router();

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find({ isActive: true }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a single event
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new event (Admin only)
router.post(
  "/",
  authenticateToken,
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const eventData = { ...req.body };

      // Automatically set the organizer to the authenticated user
      eventData.organizer = req.user.id;

      // Handle image if uploaded
      if (req.file) {
        eventData.imageUrl = `/uploads/eventImages/${req.file.filename}`;
      }

      // Convert date string to Date object
      if (eventData.date) {
        eventData.date = new Date(eventData.date);
      }

      // Parse schedule data if it comes as JSON string
      if (eventData.schedule && typeof eventData.schedule === "string") {
        try {
          eventData.schedule = JSON.parse(eventData.schedule);
        } catch (e) {
          console.error("Error parsing schedule:", e);
        }
      }

      const event = await Event.create(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      if (error.name === "ValidationError") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Update an event (Admin only)
router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const updateData = { ...req.body, updatedAt: Date.now() };

      // Handle image if uploaded
      if (req.file) {
        updateData.imageUrl = `/uploads/eventImages/${req.file.filename}`;
      }

      // Convert date string to Date object
      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      // Parse schedule data if it comes as JSON string
      if (updateData.schedule && typeof updateData.schedule === "string") {
        try {
          updateData.schedule = JSON.parse(updateData.schedule);
        } catch (e) {
          console.error("Error parsing schedule:", e);
        }
      }

      const event = await Event.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      });

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      if (error.name === "ValidationError") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Delete an event (Admin only)
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

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
    await Event.findByIdAndDelete(req.params.id);

    // Also delete all registrations for this event
    await EventRegistration.deleteMany({ event: req.params.id });

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Register for an event
router.post("/:id/register", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is already registered
    const existingRegistration = await EventRegistration.findOne({
      event: req.params.id,
      email: req.body.email,
    });

    if (existingRegistration) {
      return res
        .status(400)
        .json({ message: "You have already registered for this event" });
    }

    const registration = await EventRegistration.create({
      event: req.params.id,
      ...req.body,
    });

    res.status(201).json({
      message: "Successfully registered for the event",
      registration,
    });
  } catch (error) {
    console.error("Error registering for event:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Get registrations for an event (Admin only)
router.get(
  "/:id/registrations",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const registrations = await EventRegistration.find({
        event: req.params.id,
      }).sort({ registeredAt: -1 });
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching event registrations:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

export default router;
