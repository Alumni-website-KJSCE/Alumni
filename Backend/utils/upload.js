import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base uploads directory
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Profile images directory
const profileImagesDir = path.join(uploadsDir, "profileImages");
if (!fs.existsSync(profileImagesDir)) {
  fs.mkdirSync(profileImagesDir, { recursive: true });
}

// Event images directory
const eventImagesDir = path.join(uploadsDir, "eventImages");
if (!fs.existsSync(eventImagesDir)) {
  fs.mkdirSync(eventImagesDir, { recursive: true });
}

// Gallery images directory
const galleryImagesDir = path.join(uploadsDir, "galleryImages");
if (!fs.existsSync(galleryImagesDir)) {
  fs.mkdirSync(galleryImagesDir, { recursive: true });
}

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Select destination folder based on file field name and route
    if (file.fieldname === "profilePicture") {
      cb(null, profileImagesDir);
    } else if (file.fieldname === "eventImage") {
      cb(null, eventImagesDir);
    } else if (
      file.fieldname === "image" &&
      req.path.includes("/settings/gallery")
    ) {
      cb(null, galleryImagesDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    // Add appropriate prefix based on upload type and route
    let prefix = "file";
    if (file.fieldname === "profilePicture") prefix = "profile";
    else if (file.fieldname === "eventImage") prefix = "event";
    else if (
      file.fieldname === "image" &&
      req.path.includes("/settings/gallery")
    )
      prefix = "gallery";

    cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter to allow images and PDFs for attendance proof
const fileFilter = (req, file, cb) => {
  // List of allowed MIME types
  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/svg+xml",
  ];
  const allowedPdfType = "application/pdf";

  // Allow PDFs only for attendance proof
  if (file.fieldname === "attendanceProof") {
    if ([...allowedImageTypes, allowedPdfType].includes(file.mimetype)) {
      cb(null, true);
      return;
    }
  } else {
    // For all other uploads, only allow images
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
  }
  // If we get here, the file type is not allowed
  const allowedTypesText =
    file.fieldname === "attendanceProof"
      ? "JPG, JPEG, PNG, GIF, SVG images or PDF files"
      : "JPG, JPEG, PNG, GIF and SVG images";
  cb(
    new Error(
      `Invalid file type. Only ${allowedTypesText} are allowed. Received: ${file.mimetype}`,
    ),
    false,
  );
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export {
  upload,
  uploadsDir,
  profileImagesDir,
  eventImagesDir,
  galleryImagesDir,
};
