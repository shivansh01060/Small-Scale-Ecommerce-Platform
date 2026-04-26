const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
  getNearbyProducts,
  getProductById,
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProduct,
} = require("../controllers/productController");

// ─── Public / Buyer ───────────────────────────────────────
router.get("/", getNearbyProducts);

// ─── Seller Routes ────────────────────────────────────────
const seller = [protect, requireRole("seller")];

// IMPORTANT: /my must come BEFORE /:id, otherwise /:id catches it!
router.get("/my", seller, getSellerProducts);
router.post("/", seller, upload.array("images", 4), createProduct);
router.put("/:id", seller, upload.array("images", 4), updateProduct);
router.delete("/:id", seller, deleteProduct);
router.patch("/:id/toggle", seller, toggleProduct);

// ─── Public Product Details (must be last!) ───────────────
router.get("/:id", getProductById);

module.exports = router;
