import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
    trim: true,
  },
  venue: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        // Allow empty strings or valid URLs
        return !v || /^https?:\/\/.+\..+/.test(v);
      },
      message: (props) => `${props.value} is not a valid URL!`,
    },
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  schedule: [
    {
      time: {
        type: String,
        trim: true,
      },
      title: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
    },
  ],
  registrations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventRegistration",
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add pre-save middleware to update the updatedAt field
EventSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Event = mongoose.model("Event", EventSchema);
export default Event;
