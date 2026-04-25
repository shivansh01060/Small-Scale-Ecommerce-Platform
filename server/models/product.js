const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ["food", "handmade", "clothing", "electronics", "other"],
      required: true,
    },
    images: [{ type: String }], // Cloudinary URLs

    stock: { type: Number, default: 1, min: 0 },
    isActive: { type: Boolean, default: true }, // seller can toggle off

    // Seller's location copied here for fast geo queries
    // without having to join the User collection
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },

    apartment: { type: String }, // e.g. "Tower B, Flat 204" — shown to buyer after order
  },
  { timestamps: true },
);

// Critical — enables $nearSphere queries on products
productSchema.index({ location: "2dsphere" });
productSchema.index({ seller: 1, isActive: 1 }); // fast seller dashboard queries

module.exports = mongoose.model("Product", productSchema);
