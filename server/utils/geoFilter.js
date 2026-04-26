const EARTH_RADIUS_KM = 6371;

// Build a MongoDB $nearSphere filter for a given radius
const nearbyFilter = (lng, lat, radiusKm = 10) => ({
  location: {
    $nearSphere: {
      $geometry: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
      $maxDistance: radiusKm * 1000, // MongoDB wants metres
    },
  },
});

// Calculate straight-line distance between two [lng, lat] points (in km)
const haversineDistance = ([lng1, lat1], [lng2, lat2]) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

module.exports = { nearbyFilter, haversineDistance };
