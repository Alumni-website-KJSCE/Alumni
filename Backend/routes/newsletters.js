import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authenticateToken } from "../middleware/auth.js";
import { isAdmin } from "../middleware/adminAuth.js";
import Article from "../Models/Article.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Newsletter storage directory
const newslettersDir = path.join(__dirname, "../uploads/newsletters");

// Articles storage directory
const articlesDir = path.join(__dirname, "../uploads/articles");

// Ensure directories exist
if (!fs.existsSync(newslettersDir)) {
  fs.mkdirSync(newslettersDir, { recursive: true });
}

if (!fs.existsSync(articlesDir)) {
  fs.mkdirSync(articlesDir, { recursive: true });
}

// Configure multer for newsletter uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, newslettersDir);
  },
  filename: (req, file, cb) => {
    // Generate a temporary filename first, we'll rename it after upload
    const tempFilename = `temp_${Date.now()}.pdf`;
    cb(null, tempFilename);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Get list of available newsletters
router.get("/", (req, res) => {
  try {
    const newsletters = [];
    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    months.forEach((month) => {
      const filePath = path.join(newslettersDir, `${month}.pdf`);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        newsletters.push({
          month: month.charAt(0).toUpperCase() + month.slice(1),
          fileName: `${month}.pdf`,
          size: stats.size,
          uploadedAt: stats.mtime,
        });
      }
    });

    res.json({ newsletters });
  } catch (error) {
    console.error("Error fetching newsletters:", error);
    res.status(500).json({ message: "Failed to fetch newsletters" });
  }
});

// Download newsletter by month
router.get("/download/:month", (req, res) => {
  try {
    const { month } = req.params;
    const fileName = `${month.toLowerCase()}.pdf`;
    const filePath = path.join(newslettersDir, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Newsletter not found" });
    }

    // Set headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${month.charAt(0).toUpperCase() + month.slice(1)}_Newsletter.pdf"`,
    );

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading newsletter:", error);
    res.status(500).json({ message: "Failed to download newsletter" });
  }
});

// Upload newsletter (Admin only)
router.post("/upload", authenticateToken, isAdmin, (req, res) => {
  const uploadSingle = upload.single("newsletter");

  uploadSingle(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "File size too large. Maximum 10MB allowed." });
      }
      if (err.message === "Only PDF files are allowed") {
        return res.status(400).json({ message: "Only PDF files are allowed" });
      }
      return res
        .status(400)
        .json({ message: err.message || "File upload failed" });
    }

    try {
      const { month } = req.body;

      if (!month) {
        return res.status(400).json({ message: "Month is required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Newsletter file is required" });
      }

      // Rename the temporary file to the proper month name
      const tempFilePath = req.file.path;
      const finalFileName = `${month.toLowerCase()}.pdf`;
      const finalFilePath = path.join(newslettersDir, finalFileName);

      // Remove existing file if it exists
      if (fs.existsSync(finalFilePath)) {
        fs.unlinkSync(finalFilePath);
      }

      // Rename temp file to final name
      fs.renameSync(tempFilePath, finalFilePath);

      res.json({
        message: `Newsletter for ${month} uploaded successfully`,
        fileName: finalFileName,
        month: month,
      });
    } catch (error) {
      console.error("Error uploading newsletter:", error);
      // Clean up temp file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: "Failed to upload newsletter" });
    }
  });
});

// Delete newsletter (Admin only)
router.delete("/:month", authenticateToken, isAdmin, (req, res) => {
  try {
    const { month } = req.params;
    const fileName = `${month.toLowerCase()}.pdf`;
    const filePath = path.join(newslettersDir, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Newsletter not found" });
    }

    fs.unlinkSync(filePath);
    res.json({ message: `Newsletter for ${month} deleted successfully` });
  } catch (error) {
    console.error("Error deleting newsletter:", error);
    res.status(500).json({ message: "Failed to delete newsletter" });
  }
});

// ==================== ARTICLES MANAGEMENT ====================

// Configure multer for article images
const articleImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, articlesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "article-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const articleImageUpload = multer({
  storage: articleImageStorage,
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images
  },
});

// Get all articles
router.get("/articles", async (req, res) => {
  try {
    const articles = await Article.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
    res.json({ articles });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ message: "Failed to fetch articles" });
  }
});

// Create new article (Admin only)
router.post("/articles", authenticateToken, isAdmin, (req, res) => {
  const articleImageUploadSingle = articleImageUpload.single("image");

  articleImageUploadSingle(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "Image size too large. Maximum 5MB allowed." });
      }
      if (err.message === "Only image files are allowed") {
        return res
          .status(400)
          .json({ message: "Only image files are allowed" });
      }
      return res
        .status(400)
        .json({ message: err.message || "Image upload failed" });
    }

    try {
      const { title, description, linkUrl, linkText, order } = req.body;

      if (!title || !description) {
        return res
          .status(400)
          .json({ message: "Title and description are required" });
      }

      // Get the next order number if not provided
      let articleOrder = parseInt(order) || 1;
      if (!order) {
        const lastArticle = await Article.findOne().sort({ order: -1 }).lean();
        articleOrder = lastArticle ? lastArticle.order + 1 : 1;
      }

      const newArticle = new Article({
        title,
        description,
        imageUrl: req.file ? `/uploads/articles/${req.file.filename}` : null,
        linkUrl: linkUrl || "",
        linkText: linkText || "Read more",
        order: articleOrder,
      });

      const savedArticle = await newArticle.save();

      res.json({
        message: "Article created successfully",
        article: savedArticle,
      });
    } catch (error) {
      console.error("Error creating article:", error);
      // Clean up uploaded image if there's an error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: "Failed to create article" });
    }
  });
});

// Update article (Admin only)
router.put("/articles/:id", authenticateToken, isAdmin, (req, res) => {
  const articleImageUploadSingle = articleImageUpload.single("image");

  articleImageUploadSingle(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "Image size too large. Maximum 5MB allowed." });
      }
      if (err.message === "Only image files are allowed") {
        return res
          .status(400)
          .json({ message: "Only image files are allowed" });
      }
      return res
        .status(400)
        .json({ message: err.message || "Image upload failed" });
    }

    try {
      const { id } = req.params;
      const { title, description, linkUrl, linkText, order } = req.body;

      if (!title || !description) {
        return res
          .status(400)
          .json({ message: "Title and description are required" });
      }

      const existingArticle = await Article.findById(id);

      if (!existingArticle) {
        return res.status(404).json({ message: "Article not found" });
      }

      // If new image uploaded, delete old image
      if (req.file && existingArticle.imageUrl) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          existingArticle.imageUrl,
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      const updateData = {
        title,
        description,
        imageUrl: req.file
          ? `/uploads/articles/${req.file.filename}`
          : existingArticle.imageUrl,
        linkUrl: linkUrl || "",
        linkText: linkText || "Read more",
        order: parseInt(order) || existingArticle.order,
      };

      const updatedArticle = await Article.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      res.json({
        message: "Article updated successfully",
        article: updatedArticle,
      });
    } catch (error) {
      console.error("Error updating article:", error);
      // Clean up uploaded image if there's an error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: "Failed to update article" });
    }
  });
});

// Delete article (Admin only)
router.delete("/articles/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Delete associated image if it exists
    if (article.imageUrl) {
      const imagePath = path.join(__dirname, "..", article.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Article.findByIdAndDelete(id);

    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ message: "Failed to delete article" });
  }
});

export default router;
