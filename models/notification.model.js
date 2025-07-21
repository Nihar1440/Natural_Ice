import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["order", "info", "warning"],
    default: "info",
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
//   link: {
//     type: String, // Optional: link to order details, offer page etc.
//     default: "",
//   },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});


export default mongoose.model("Notification", NotificationSchema);
