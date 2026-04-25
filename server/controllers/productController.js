const Product = require("../models/Product");
const User = require("../models/User");

// ─── BUYER ────────────────────────────────────────────────
// GET /api/products?lng=77.20&lat=28.61&category=food&search=cake
const getNearbyProducts = async (req, res) => {
  const { lng, lat, category, search } = req.query;
  if (!lng || !lat)
    return res.status(400).json({ message: "Buyer location required" });

  try {
    const filter = {
      isActive: true,
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 10000,
        },
      },
    };

    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    const products = await Product.find(filter)
      .populate("seller", "name apartment")
      .select("-__v")
      .limit(50);

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/:id  — single product detail page
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name apartment location",
    );
    if (!product || !product.isActive)
      return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── SELLER ───────────────────────────────────────────────
// GET /api/products/my
const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort(
      "-createdAt",
    );
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  const { title, description, price, category, stock, apartment } = req.body;
  try {
    const seller = await User.findById(req.user._id);
    if (!seller.location?.coordinates?.length)
      return res
        .status(400)
        .json({ message: "Set your location before listing products" });

    // Images come from Cloudinary via upload middleware — req.files has the URLs
    const images = req.files?.map((f) => f.path) || [];

    const product = await Product.create({
      seller: req.user._id,
      title,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      apartment,
      images,
      location: seller.location,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id, // ensures seller can only edit their own
    });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { title, description, price, category, stock, isActive, apartment } =
      req.body;
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (stock !== undefined) product.stock = parseInt(stock);
    if (isActive !== undefined) product.isActive = isActive;
    if (apartment) product.apartment = apartment;

    // If new images uploaded, append to existing
    if (req.files?.length) product.images.push(...req.files.map((f) => f.path));

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      seller: req.user._id,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/products/:id/toggle  — quick active/inactive toggle
const toggleProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
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
