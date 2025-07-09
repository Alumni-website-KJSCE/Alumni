import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    linkUrl: {
      type: String,
      default: "",
    },
    linkText: {
      type: String,
      default: "Read more",
    },
    order: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt automatically
  },
);

// Add index for ordering
articleSchema.index({ order: 1 });

const Article = mongoose.model("Article", articleSchema);

export default Article;
