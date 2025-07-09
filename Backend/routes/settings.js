import express from "express";
import SiteSettings from "../Models/SiteSettings.js";
import { isAdmin } from "../middleware/adminAuth.js";
import { authenticateToken } from "../middleware/auth.js";
import { upload } from "../utils/upload.js";
import { deleteFile, cleanupGalleryFiles } from "../utils/fileCleanup.js";

const router = express.Router();

// Get site settings
router.get("/settings", async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({
        campusGallery: [],
        featuredVideos: [],
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update site settings (admin only)
router.put("/settings", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { featuredVideo } = req.body;
    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = new SiteSettings();
    }

    if (featuredVideo) {
      settings.featuredVideo = featuredVideo;
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add gallery image (admin only)
router.post(
  "/settings/gallery",
  authenticateToken,
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { caption, order, category, year } = req.body;

      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded" });
      }

      // Validate category
      if (
        !category ||
        ![
          "Academic",
          "Sports",
          "Cultural",
          "Infrastructure",
          "Events",
          "Alumni Visits",
        ].includes(category)
      ) {
        return res.status(400).json({ message: "Invalid category" });
      }

      // Validate year for Alumni Visits
      if (category === "Alumni Visits") {
        if (!year || isNaN(year)) {
          return res.status(400).json({ message: "Year is required for Alumni Visits" });
        }
        const yearNum = parseInt(year);
        const currentYear = new Date().getFullYear();
        if (yearNum < 1950 || yearNum > currentYear) {
          return res.status(400).json({ 
            message: `Year must be between 1950 and ${currentYear}` 
          });
        }
      }

      const imageUrl = `/uploads/galleryImages/${req.file.filename}`;

      let settings = await SiteSettings.findOne();
      if (!settings) {
        settings = new SiteSettings();
      }

      const newImage = {
        imageUrl,
        caption,
        category,
        order: parseInt(order) || settings.campusGallery.length,
      };

      // Add year only for Alumni Visits
      if (category === "Alumni Visits") {
        newImage.year = parseInt(year);
      }

      settings.campusGallery.push(newImage);

      // Sort by order
      settings.campusGallery.sort((a, b) => a.order - b.order);
      await settings.save();

      res.json(settings);
    } catch (error) {
      console.error("Gallery upload error:", error);
      res.status(500).json({
        message: error.message || "Failed to upload gallery image",
        details: error.stack,
      });
    }
  },
);

// Delete gallery image (admin only)
router.delete(
  "/settings/gallery/:imageId",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const settings = await SiteSettings.findOne();
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }

      // Find the image to be deleted to get its file path
      const imageToDelete = settings.campusGallery.find(
        (img) => img._id.toString() === req.params.imageId,
      );

      if (imageToDelete && imageToDelete.imageUrl) {
        // Clean up the file from filesystem
        try {
          await deleteFile(imageToDelete.imageUrl);
          console.log("File cleanup: Gallery image file deleted successfully");
        } catch (cleanupError) {
          console.error(
            "File cleanup: Error deleting gallery image file:",
            cleanupError,
          );
          // Continue with database deletion even if file cleanup fails
        }
      }

      settings.campusGallery = settings.campusGallery.filter(
        (img) => img._id.toString() !== req.params.imageId,
      );

      await settings.save();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Update gallery image order (admin only)
router.put(
  "/settings/gallery/reorder",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { orderedIds } = req.body;
      const settings = await SiteSettings.findOne();

      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }

      // Update order based on array position
      orderedIds.forEach((id, index) => {
        const image = settings.campusGallery.find(
          (img) => img._id.toString() === id,
        );
        if (image) {
          image.order = index;
        }
      });

      // Sort by new order
      settings.campusGallery.sort((a, b) => a.order - b.order);
      await settings.save();

      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Add a new featured video (admin only)
router.post(
  "/settings/videos",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { videoUrl, title, description, order } = req.body;
      if (!videoUrl || !title) {
        return res
          .status(400)
          .json({ message: "videoUrl and title are required" });
      }
      let settings = await SiteSettings.findOne();
      if (!settings)
        settings = new SiteSettings({ campusGallery: [], featuredVideos: [] });
      settings.featuredVideos.push({
        videoUrl,
        title,
        description: description || "",
        order: parseInt(order) || settings.featuredVideos.length,
      });
      settings.featuredVideos.sort((a, b) => a.order - b.order);
      await settings.save();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Delete a featured video (admin only)
router.delete(
  "/settings/videos/:videoId",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const settings = await SiteSettings.findOne();
      if (!settings)
        return res.status(404).json({ message: "Settings not found" });
      settings.featuredVideos = settings.featuredVideos.filter(
        (v) => v._id.toString() !== req.params.videoId,
      );
      await settings.save();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Reorder featured videos (admin only)
router.put(
  "/settings/videos/reorder",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { orderedIds } = req.body;
      const settings = await SiteSettings.findOne();
      if (!settings)
        return res.status(404).json({ message: "Settings not found" });
      orderedIds.forEach((id, index) => {
        const vid = settings.featuredVideos.find(
          (v) => v._id.toString() === id,
        );
        if (vid) vid.order = index;
      });
      settings.featuredVideos.sort((a, b) => a.order - b.order);
      await settings.save();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Add a stay connected item (admin only)
router.post(
  "/settings/stay-connected",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { title, description, linkUrl, linkText, category, order } =
        req.body;

      // Validate required fields
      if (!title || !description || !category) {
        return res
          .status(400)
          .json({ message: "Title, description, and category are required" });
      }

      // Validate category
      if (!["news", "events", "campaigns", "career"].includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }

      let settings = await SiteSettings.findOne();
      if (!settings) {
        settings = new SiteSettings({
          campusGallery: [],
          featuredVideos: [],
          stayConnected: [],
        });
      }

      // Add the new stay connected item
      settings.stayConnected.push({
        title,
        description,
        linkUrl: linkUrl || "",
        linkText: linkText || "Learn More",
        category,
        order: parseInt(order) || settings.stayConnected.length,
      });

      // Sort by order within each category
      settings.stayConnected.sort((a, b) => {
        if (a.category === b.category) {
          return a.order - b.order;
        }
        return 0;
      });

      await settings.save();
      res.json(settings);
    } catch (error) {
      console.error("Error adding stay connected item:", error);
      res.status(500).json({
        message: error.message || "Failed to add stay connected item",
        details: error.stack,
      });
    }
  },
);

// Update a stay connected item (admin only)
router.put(
  "/settings/stay-connected/:itemId",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { title, description, linkUrl, linkText, category, order } =
        req.body;

      let settings = await SiteSettings.findOne();
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }

      // Find the item to update
      const itemIndex = settings.stayConnected.findIndex(
        (item) => item._id.toString() === req.params.itemId,
      );

      if (itemIndex === -1) {
        return res
          .status(404)
          .json({ message: "Stay connected item not found" });
      }

      // Update the item
      if (title) settings.stayConnected[itemIndex].title = title;
      if (description)
        settings.stayConnected[itemIndex].description = description;
      if (linkUrl !== undefined)
        settings.stayConnected[itemIndex].linkUrl = linkUrl;
      if (linkText) settings.stayConnected[itemIndex].linkText = linkText;
      if (
        category &&
        ["news", "events", "campaigns", "career"].includes(category)
      ) {
        settings.stayConnected[itemIndex].category = category;
      }
      if (order !== undefined)
        settings.stayConnected[itemIndex].order = parseInt(order);

      // Sort by order within each category
      settings.stayConnected.sort((a, b) => {
        if (a.category === b.category) {
          return a.order - b.order;
        }
        return 0;
      });

      await settings.save();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Delete a stay connected item (admin only)
router.delete(
  "/settings/stay-connected/:itemId",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const settings = await SiteSettings.findOne();
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }

      // Filter out the item to delete
      settings.stayConnected = settings.stayConnected.filter(
        (item) => item._id.toString() !== req.params.itemId,
      );

      await settings.save();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

export default router;
