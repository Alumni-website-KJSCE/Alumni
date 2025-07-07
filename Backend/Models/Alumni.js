import mongoose from "mongoose";

const AlumniSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Branch: {
      type: String,
      required: true,
      enum: ["MECH", "PROD", "M/C T", "ETRX", "EXTC", "COMP", "IT", "AIDS"],
    },
    "Year of Passing": {
      type: Number,
      required: true,
    },
    Company: {
      type: String,
      default: "N/A",
    },
    Designation: {
      type: String,
      default: "N/A",
    },
    "LinkedIn Profile Link": {
      type: String,
      default: "N/A",
    },
    linkedinProfileLink: {
      type: String,
      default: "",
    },
    Location: {
      type: String,
      default: "N/A",
    },
    profileImage: {
      type: String,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
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
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("alumnis", AlumniSchema);
