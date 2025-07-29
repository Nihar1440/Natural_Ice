import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    guestId: {
      type: String,
      required: false,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    items: [
      {
        name: String,
        quantity: Number,
        price: Number,
        productId: String,
        category: String,
        originalPrice: Number,
        image: String,
        returnedQuantity: {
          type: Number,
          default: 0,
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String },
      phoneNumber: { type: String },
      addressLine: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Returned", "Cancelled"],
      default: "Pending",
    },
    currentLocation: { type: String },
    estimatedDeliveryDate: { type: Date },

    deliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deliveryNotes: { type: String },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },

    trackingHistory: [
      {
        status: String,
        location: String,
        timestamp: Date,
      },
    ],
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
