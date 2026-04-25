const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

router.post("/", protect, requireRole("buyer"), createOrder);
router.get("/my", protect, requireRole("buyer"), getBuyerOrders);
router.get("/seller", protect, requireRole("seller"), getSellerOrders);
router.patch("/:id/status", protect, requireRole("seller"), updateOrderStatus);

module.exports = router;
