import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    guestId: { type: String },
    email: { type: String, required: true },

    amount: { type: Number, required: true },
    // currency: { type: String, default: 'INR' },

    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    paymentMethod: { type: String }, // card, upi
    gateway: { type: String }, // stripe, razorpay
    sessionId: { type: String },

    receiptUrl: { type: String },
    refundedAmount: { type: Number, default: 0 },

    paymentTime: { type: Date }, 
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);
