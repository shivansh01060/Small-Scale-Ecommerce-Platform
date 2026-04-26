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
      enum: ["food", "furniture", "clothing", "electronics", "other"],
      required: true,
    },
    images: [{ type: String }],
    stock: { type: Number, default: 1, min: 0 },
    isActive: { type: Boolean, default: true },
    apartment: { type: String },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
  },
  { timestamps: true },
);

productSchema.index({ location: "2dsphere" });
productSchema.index({ seller: 1, isActive: 1 });

module.exports = mongoose.model("Product", productSchema);
