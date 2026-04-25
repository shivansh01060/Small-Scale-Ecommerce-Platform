const Product = require("../models/Product");

// GET /api/products?lng=77.2090&lat=28.6139
const getNearbyProducts = async (req, res) => {
  const { lng, lat } = req.query;

  if (!lng || !lat)
    return res
      .status(400)
      .json({ message: "Location required to browse products" });

  try {
    const products = await Product.find({
      isActive: true,
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 10000, // 10km in metres
        },
      },
    })
      .populate("seller", "name apartment")
      .select("-__v")
      .limit(50);

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
