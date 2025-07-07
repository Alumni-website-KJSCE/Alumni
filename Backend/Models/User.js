import mongoose from "mongoose";
import {
  BRANCHES,
  QUALIFICATIONS,
  CONTRIBUTION_TYPES,
  USER_STATUS,
} from "../utils/constants.js";

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  profilePicture: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  branch: {
    type: String,
    enum: BRANCHES,
  },
  graduationYear: {
    type: Number,
  },
  highestQualification: {
    type: String,
    enum: QUALIFICATIONS,
  },
  attendanceProof: {
    type: String,
  },
  company: {
    type: String,
  },
  currentPosting: {
    type: String,
  },
  location: {
    type: String,
  },
  linkedin: {
    type: String,
  },
  otherSocialLinks: {
    type: Object,
    default: {},
  },
  councilMember: {
    type: Boolean,
    default: false,
  },
  councils: [
    {
      councilName: {
        type: String,
      },
      councilPosition: {
        type: String,
      },
    },
  ],
  contributionInterest: {
    type: String,
    enum: CONTRIBUTION_TYPES,
  },
  contributionDetails: {
    type: String,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  rejectionComment: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", userSchema);
