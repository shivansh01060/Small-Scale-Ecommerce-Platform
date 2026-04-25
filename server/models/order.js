const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  title: { type: String, required: true }, // snapshot at order time
  price: { type: Number, required: true }, // snapshot — won't change if seller edits
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "ready", "delivered", "cancelled"],
      default: "pending",
    },

    // Delivery details
    deliveryAddress: { type: String, required: true }, // buyer's flat/tower
    contactNumber: { type: String },

    // Payment
    paymentMethod: { type: String, enum: ["cod", "online"], default: "cod" },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },

    // Optional note from buyer
    note: { type: String },
  },
  { timestamps: true },
);

// Fast lookups for both dashboards
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
