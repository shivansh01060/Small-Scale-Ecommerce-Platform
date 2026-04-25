const Order = require("../models/Order");
const Product = require("../models/Product");

// POST /api/orders  — buyer places order
const createOrder = async (req, res) => {
  const { items, deliveryAddress, contactNumber, note, paymentMethod } =
    req.body;
  try {
    // Validate stock and build item snapshots
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive)
        return res
          .status(400)
          .json({ message: `${item.product} is no longer available` });
      if (product.stock < item.quantity)
        return res
          .status(400)
          .json({ message: `Not enough stock for ${product.title}` });

      // Deduct stock
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

    // All items must be from same seller (apartment-local constraint)
    const sellerIds = [
      ...new Set(
        await Promise.all(
          items.map(async (i) => {
            const p = await Product.findById(i.product).select("seller");
            return p.seller.toString();
          }),
        ),
      ),
    ];
    if (sellerIds.length > 1)
      return res
        .status(400)
        .json({ message: "Order must be from a single seller" });

    const order = await Order.create({
      buyer: req.user._id,
      seller: sellerIds[0],
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

// GET /api/orders/my  — buyer's order history
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

// GET /api/orders/seller  — seller's incoming orders
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

// PATCH /api/orders/:id/status  — seller updates order status
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
