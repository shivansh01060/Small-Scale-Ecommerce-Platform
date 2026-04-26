const Order = require("../models/Order");
const Product = require("../models/Product");
const { haversineDistance } = require("../utils/geoFilter");

const createOrder = async (req, res) => {
  const {
    items,
    deliveryAddress,
    contactNumber,
    note,
    paymentMethod,
    buyerLng,
    buyerLat,
  } = req.body;

  // ✅ Get location from request not DB
  if (!buyerLng || !buyerLat)
    return res.status(400).json({ message: "Buyer location is required" });

  const buyerCoords = [parseFloat(buyerLng), parseFloat(buyerLat)];

  try {
    let totalAmount = 0;
    let sellerId = null;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive)
        return res
          .status(400)
          .json({ message: "A product is no longer available" });

      const dist = haversineDistance(buyerCoords, product.location.coordinates);
      if (dist > 10)
        return res.status(403).json({
          message: `Seller is ${dist.toFixed(1)}km away — outside your 10km zone`,
        });

      if (product.stock < item.quantity)
        return res
          .status(400)
          .json({ message: `Not enough stock for ${product.title}` });

      if (sellerId && sellerId !== product.seller.toString())
        return res
          .status(400)
          .json({ message: "All items must be from the same seller" });

      sellerId = product.seller.toString();
      product.stock -= item.quantity;
      await product.save();

      orderItems.push({
        product: product._id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || "",
      });
      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      buyer: req.user._id,
      seller: sellerId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      contactNumber,
      note,
      paymentMethod: paymentMethod || "cod",
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .sort("-createdAt")
      .populate("seller", "name apartment");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .sort("-createdAt")
      .populate("buyer", "name");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ["confirmed", "ready", "delivered", "cancelled"];
  if (!allowed.includes(status))
    return res.status(400).json({ message: "Invalid status" });
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      seller: req.user._id,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  updateOrderStatus,
};
