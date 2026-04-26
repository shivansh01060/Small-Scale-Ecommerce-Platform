const Product = require("../models/Product");
const User = require("../models/User");
const { nearbyFilter, haversineDistance } = require("../utils/geoFilter");

const getNearbyProducts = async (req, res) => {
  const { lng, lat, radius = 10, category, search } = req.query;
  if (!lng || !lat)
    return res.status(400).json({ message: "Buyer location is required" });

  const safeRadius = Math.min(parseFloat(radius), 10);
  try {
    const filter = { isActive: true, ...nearbyFilter(lng, lat, safeRadius) };
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    const products = await Product.find(filter)
      .populate("seller", "name apartment")
      .select("-__v")
      .limit(50)
      .lean();

    const buyerCoords = [parseFloat(lng), parseFloat(lat)];
    const withDistance = products.map((p) => ({
      ...p,
      distanceKm: haversineDistance(
        buyerCoords,
        p.location.coordinates,
      ).toFixed(1),
    }));
    withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
    res.json(withDistance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name apartment location")
      .select("-__v");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .select("-__v")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createProduct = async (req, res) => {
  const { title, description, price, category, stock, apartment } = req.body;
  try {
    const seller = await User.findById(req.user._id);

    // ✅ Proper location check
    if (!seller.location?.coordinates?.length)
      return res
        .status(400)
        .json({ message: "Seller location not set. Please re-register." });

    const images = req.files ? req.files.map((f) => f.path) : [];

    const product = await Product.create({
      title,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock) || 1,
      apartment, // ✅ saved
      images,
      seller: req.user._id,
      location: seller.location,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProduct = async (req, res) => {
  const { title, description, price, category, stock, apartment, isActive } =
    req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (title) product.title = title;
    if (description) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (category) product.category = category;
    if (stock !== undefined) product.stock = parseInt(stock);
    if (apartment) product.apartment = apartment;
    if (isActive !== undefined) product.isActive = isActive;

    // ✅ Append new images instead of replacing
    // if (req.files?.length) product.images.push(...req.files.map((f) => f.path));
    const images = req.files
      ? req.files.map((f) => `/uploads/${f.filename}`)
      : [];
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    product.isActive = !product.isActive;
    await product.save();
    res.json({ isActive: product.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getNearbyProducts,
  getProductById,
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProduct,
};
