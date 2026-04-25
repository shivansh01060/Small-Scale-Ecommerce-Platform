const Product = require("../models/Product");
const User = require("../models/User");
const { nearbyFilter, haversineDistance } = require("../utils/geoFilter");

// GET /api/products?lng=78.00&lat=27.17&radius=10&category=food&search=biryani
const getNearbyProducts = async (req, res) => {
  const { lng, lat, radius = 10, category, search } = req.query;

  if (!lng || !lat)
    return res.status(400).json({ message: "Buyer location is required" });

  // Clamp radius — sellers can't list beyond 10km anyway, but don't let
  // a malicious request query half the country
  const safeRadius = Math.min(parseFloat(radius), 10);

  try {
    const filter = {
      isActive: true,
      ...nearbyFilter(lng, lat, safeRadius),
    };

    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    const products = await Product.find(filter)
      .populate("seller", "name apartment")
      .select("-__v")
      .limit(50)
      .lean(); // .lean() returns plain JS objects — faster, lets us add fields below

    // Attach distance to each product so the frontend can display "1.2 km away"
    const buyerCoords = [parseFloat(lng), parseFloat(lat)];
    const withDistance = products.map((p) => ({
      ...p,
      distanceKm: haversineDistance(
        buyerCoords,
        p.location.coordinates,
      ).toFixed(1),
    }));

    // Sort by distance ascending (nearest first)
    withDistance.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json(withDistance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
