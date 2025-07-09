import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Delete a single file from the filesystem
 * @param {string} filePath - Relative path to the file (e.g., 'uploads/profileImages/profile-123.jpg')
 * @returns {Promise<boolean>} - True if file was deleted or didn't exist, false if error
 */
async function deleteFile(filePath) {
  try {
    if (!filePath) {
      console.warn("File cleanup: No file path provided");
      return true;
    }

    // Convert relative path to absolute path
    const absolutePath = path.join(__dirname, "..", filePath);

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      console.warn(`File cleanup: File does not exist - ${filePath}`);
      return true; // Consider it successful if file doesn't exist
    }

    // Delete the file
    await fs.promises.unlink(absolutePath);
    console.log(`File cleanup: Successfully deleted - ${filePath}`);
    return true;
  } catch (error) {
    console.error(`File cleanup: Error deleting file ${filePath}:`, error);
    return false;
  }
}

/**
 * Delete multiple files from the filesystem
 * @param {string[]} filePaths - Array of relative file paths
 * @returns {Promise<{success: number, failed: number}>} - Count of successful and failed deletions
 */
async function deleteFiles(filePaths) {
  const results = { success: 0, failed: 0 };

  if (!Array.isArray(filePaths) || filePaths.length === 0) {
    console.warn("File cleanup: No file paths provided for batch deletion");
    return results;
  }

  for (const filePath of filePaths) {
    const success = await deleteFile(filePath);
    if (success) {
      results.success++;
    } else {
      results.failed++;
    }
  }

  console.log(
    `File cleanup: Batch deletion completed - ${results.success} successful, ${results.failed} failed`,
  );
  return results;
}

/**
 * Clean up user-related files (profile picture)
 * @param {Object} user - User object with file references
 * @returns {Promise<boolean>} - True if cleanup was successful
 */
async function cleanupUserFiles(user) {
  try {
    const filesToDelete = [];

    if (user.profilePicture) {
      filesToDelete.push(user.profilePicture);
    }

    if (filesToDelete.length === 0) {
      console.log("File cleanup: No user files to delete");
      return true;
    }

    const results = await deleteFiles(filesToDelete);
    return results.failed === 0;
  } catch (error) {
    console.error("File cleanup: Error cleaning up user files:", error);
    return false;
  }
}

/**
 * Clean up event-related files (event image)
 * @param {Object} event - Event object with file references
 * @returns {Promise<boolean>} - True if cleanup was successful
 */
async function cleanupEventFiles(event) {
  try {
    const filesToDelete = [];

    if (event.imageUrl) {
      filesToDelete.push(event.imageUrl);
    }

    if (filesToDelete.length === 0) {
      console.log("File cleanup: No event files to delete");
      return true;
    }

    const results = await deleteFiles(filesToDelete);
    return results.failed === 0;
  } catch (error) {
    console.error("File cleanup: Error cleaning up event files:", error);
    return false;
  }
}

/**
 * Clean up gallery images from site settings
 * @param {string[]} galleryImages - Array of gallery image paths to delete
 * @returns {Promise<boolean>} - True if cleanup was successful
 */
async function cleanupGalleryFiles(galleryImages) {
  try {
    if (!Array.isArray(galleryImages) || galleryImages.length === 0) {
      console.log("File cleanup: No gallery files to delete");
      return true;
    }

    const results = await deleteFiles(galleryImages);
    return results.failed === 0;
  } catch (error) {
    console.error("File cleanup: Error cleaning up gallery files:", error);
    return false;
  }
}

/**
 * Find and clean up orphaned files in a directory
 * @param {string} directory - Directory to scan (relative to uploads folder)
 * @param {string[]} activeFiles - Array of active file paths that should not be deleted
 * @returns {Promise<{deleted: number, errors: number}>} - Count of deleted files and errors
 */
async function cleanupOrphanedFiles(directory, activeFiles = []) {
  try {
    const uploadsDir = path.join(__dirname, "..", "uploads", directory);
    const results = { deleted: 0, errors: 0 };

    if (!fs.existsSync(uploadsDir)) {
      console.warn(`File cleanup: Directory does not exist - ${directory}`);
      return results;
    }
    const files = await fs.promises.readdir(uploadsDir);

    // Get the list of active file names from the full paths
    const activeFileNames = activeFiles.map((filePath) => {
      // Handle both absolute and relative paths
      const basename = path.basename(filePath);
      return basename;
    });

    console.log(
      `File cleanup: Found ${files.length} files in ${directory}, ${activeFileNames.length} are referenced in database`,
    );
    console.log("Active files:", activeFileNames);

    const RETENTION_PERIOD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds - files must be older than this to be deleted
    const now = Date.now();

    for (const file of files) {
      // Skip directories
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.promises.stat(filePath);
      if (stats.isDirectory()) {
        continue;
      }

      // Check if file is in active files list - comparing basename to basename
      if (!activeFileNames.includes(file)) {
        // Only delete files older than retention period
        if (now - stats.mtimeMs < RETENTION_PERIOD) {
          console.log(
            `File cleanup: Skipping recent file - ${directory}/${file}`,
          );
          continue;
        }

        try {
          await fs.promises.unlink(filePath);
          results.deleted++;
          console.log(
            `File cleanup: Deleted orphaned file - ${directory}/${file}`,
          );
        } catch (error) {
          results.errors++;
          console.error(
            `File cleanup: Error deleting orphaned file ${directory}/${file}:`,
            error,
          );
        }
      }
    }

    console.log(
      `File cleanup: Orphaned file cleanup completed for ${directory} - ${results.deleted} deleted, ${results.errors} errors`,
    );
    return results;
  } catch (error) {
    console.error(
      `File cleanup: Error scanning directory ${directory}:`,
      error,
    );
    return { deleted: 0, errors: 1 };
  }
}

/**
 * Run a comprehensive cleanup of all orphaned files
 * @returns {Promise<Object>} - Summary of cleanup results
 */
async function runOrphanedFileCleanup() {
  try {
    console.log(
      "File cleanup: Starting comprehensive orphaned file cleanup...",
    );

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error(
        "File cleanup: Database not connected. Skipping file cleanup.",
      );
      return {
        success: false,
        totalDeleted: 0,
        totalErrors: 1,
        error: "Database not connected",
      };
    }

    // Import models to get active file references
    const User = (await import("../Models/User.js")).default;
    const Event = (await import("../Models/Event.js")).default;
    const Article = (await import("../Models/Article.js")).default;
    const SiteSettings = (await import("../Models/SiteSettings.js")).default;

    // Get all active file references
    const [users, events, articles, siteSettings] = await Promise.all([
      User.find({}, "profilePicture attendanceProof").lean(),
      Event.find({}, "imageUrl").lean(),
      Article.find({}, "imageUrl").lean(),
      SiteSettings.findOne({}, "galleryImages").lean(),
    ]);

    // Collect active file paths
    const activeProfileImages = users
      .filter((user) => user.profilePicture)
      .map((user) => user.profilePicture);

    const activeEventImages = events
      .filter((event) => event.imageUrl)
      .map((event) => event.imageUrl);

    const activeArticleImages = articles
      .filter((article) => article.imageUrl)
      .map((article) => article.imageUrl);

    const activeGalleryImages = siteSettings?.galleryImages || [];

    // Collect attendance proof files
    const activeAttendanceProofs = users
      .filter((user) => user.attendanceProof)
      .map((user) => user.attendanceProof);

    console.log(
      `File cleanup: Active profile images: ${activeProfileImages.length}`,
    );
    console.log(
      `File cleanup: Active event images: ${activeEventImages.length}`,
    );
    console.log(
      `File cleanup: Active article images: ${activeArticleImages.length}`,
    );
    console.log(
      `File cleanup: Active gallery images: ${activeGalleryImages.length}`,
    );
    console.log(
      `File cleanup: Active attendance proofs: ${activeAttendanceProofs.length}`,
    );

    // Clean up each directory
    const results = {
      profileImages: await cleanupOrphanedFiles(
        "profileImages",
        activeProfileImages,
      ),
      eventImages: await cleanupOrphanedFiles("eventImages", activeEventImages),
      articleImages: await cleanupOrphanedFiles(
        "articles",
        activeArticleImages,
      ),
      galleryImages: await cleanupOrphanedFiles(
        "galleryImages",
        activeGalleryImages,
      ),
      mainUploads: await cleanupOrphanedFiles("", activeAttendanceProofs),
    };

    const totalDeleted = Object.values(results).reduce(
      (sum, result) => sum + result.deleted,
      0,
    );
    const totalErrors = Object.values(results).reduce(
      (sum, result) => sum + result.errors,
      0,
    );

    console.log(
      `File cleanup: Comprehensive cleanup completed - ${totalDeleted} files deleted, ${totalErrors} errors`,
    );

    return {
      success: totalErrors === 0,
      totalDeleted,
      totalErrors,
      details: results,
    };
  } catch (error) {
    console.error("File cleanup: Error during comprehensive cleanup:", error);
    return {
      success: false,
      totalDeleted: 0,
      totalErrors: 1,
      error: error.message,
    };
  }
}

export {
  deleteFile,
  deleteFiles,
  cleanupUserFiles,
  cleanupEventFiles,
  cleanupGalleryFiles,
  cleanupOrphanedFiles,
  runOrphanedFileCleanup,
};
