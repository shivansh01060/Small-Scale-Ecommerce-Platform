const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
  getNearbyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
} = require("../controllers/productController");

router.get("/", getNearbyProducts); // buyer — needs ?lng&lat
router.get("/my", protect, requireRole("seller"), getSellerProducts); // seller dashboard
router.post("/", protect, requireRole("seller"), createProduct);
router.put("/:id", protect, requireRole("seller"), updateProduct);
router.delete("/:id", protect, requireRole("seller"), deleteProduct);

module.exports = router;
