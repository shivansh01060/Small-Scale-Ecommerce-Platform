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
router.get("/", getNearbyProducts); // ?lng=&lat=&category=&search=
router.get("/:id", getProductById);

// ─── Seller only ──────────────────────────────────────────
const seller = [protect, requireRole("seller")];

router.get("/my", ...seller, getSellerProducts);
router.post("/", ...seller, upload.array("images", 4), createProduct);
router.put("/:id", ...seller, upload.array("images", 4), updateProduct);
router.delete("/:id", ...seller, deleteProduct);
router.patch("/:id/toggle", ...seller, toggleProduct);

module.exports = router;
