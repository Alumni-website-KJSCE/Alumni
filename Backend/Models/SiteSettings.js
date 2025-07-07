import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Academic",
      "Sports",
      "Cultural",
      "Infrastructure",
      "Events",
      "Alumni Visits",
    ],
  },
  order: {
    type: Number,
    default: 0,
  },
});

const stayConnectedItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    linkUrl: {
      type: String,
      required: false,
    },
    linkText: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: true,
      enum: ["news", "events", "campaigns", "career"],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: false },
);

const siteSettingsSchema = new mongoose.Schema(
  {
    campusGallery: [galleryImageSchema],
    featuredVideos: [
      new mongoose.Schema(
        {
          videoUrl: { type: String, required: true },
          title: { type: String, required: true },
          description: { type: String, required: false },
          order: { type: Number, default: 0 },
        },
        { timestamps: false },
      ),
    ],
    stayConnected: [stayConnectedItemSchema],
  },
  { timestamps: true },
);

// Ensure only one document exists
siteSettingsSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    if (count > 0) {
      throw new Error("Only one settings document can exist");
    }
  }
  next();
});

export default mongoose.model("SiteSettings", siteSettingsSchema);
