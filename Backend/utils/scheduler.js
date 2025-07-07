import cron from "node-cron";
import { runOrphanedFileCleanup } from "./fileCleanup.js";

/**
 * Start scheduled file cleanup jobs
 */
function startScheduledCleanup() {
  // Run orphaned file cleanup once a week on Sunday at 2 AM

  // Run orphaned file cleanup once a week at 2 AM Sunday
  cron.schedule(
    "0 2 * * 0",
    async () => {
      console.log("Scheduler: Starting weekly orphaned file cleanup...");
      try {
        // Check database connection first
        if (mongoose.connection.readyState !== 1) {
          console.error(
            "Scheduler: Database not connected. Skipping file cleanup.",
          );
          return;
        }

        const results = await runOrphanedFileCleanup();
        console.log("Scheduler: Orphaned file cleanup completed:", {
          success: results.success,
          totalDeleted: results.totalDeleted,
          totalErrors: results.totalErrors,
        });
      } catch (error) {
        console.error("Scheduler: Error during scheduled file cleanup:", error);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata", // Adjust timezone as needed
    },
  );

  console.log("Scheduler: File cleanup scheduled jobs started");
  console.log("- Daily full cleanup: Every day at 2:00 AM");
  console.log("- Light cleanup check: Every 6 hours");
}

/**
 * Stop all scheduled tasks
 */
function stopScheduledCleanup() {
  cron.getTasks().forEach((task) => task.stop());
  console.log("Scheduler: All scheduled cleanup tasks stopped");
}

export { startScheduledCleanup, stopScheduledCleanup };
