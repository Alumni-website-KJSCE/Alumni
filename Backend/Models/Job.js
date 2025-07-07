import mongoose from "mongoose";
import { JOB_TYPES, JOB_MODES } from "../utils/constants.js";

const jobSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  pay: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  applyBy: {
    type: Date,
    required: true,
  },
  applyLink: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    enum: [JOB_TYPES.JOB, JOB_TYPES.INTERNSHIP],
    required: true,
  },
  jobMode: {
    type: String,
    enum: Object.values(JOB_MODES),
    required: true,
  },
  duration: {
    type: String,
    // Required only for internships
    required: function () {
      return this.jobType === "internship";
    },
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejectionComment: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Job", jobSchema);
