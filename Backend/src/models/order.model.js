const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        totalPrice: {
          type: Number,
          required: true,
        },
        costPrice: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 },
        productCost: { type: Number, default: 0 },
        totalCost: { type: Number, default: 0 },
        profit: { type: Number, default: 0 },
        margin: { type: Number, default: 0 },
        roi: { type: Number, default: 0 },
        returnStatus: {
          type: String,
          enum: ["None", "Requested", "Returned"],
          default: "None",
        },
      },
    ],
    subtotalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },
    razorpayOrderId: {
      type: String,
    },
    paymentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Pending",
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    returnRequest: {
      isRequested: { type: Boolean, default: false },
      reason: { type: String },
      status: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none",
      },
      requestedAt: { type: Date },
    },
  },
  { timestamps: true },
);

orderSchema.index({ orderStatus: 1 });
orderSchema.index({ "items.productId": 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ userId: 1 });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
