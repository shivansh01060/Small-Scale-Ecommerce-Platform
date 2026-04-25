// client/src/services/productService.js
import api from "./api";

export const getNearbyProducts = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { data } = await api.get(
          `/api/products?lng=${coords.longitude}&lat=${coords.latitude}`,
        );
        resolve(data);
      },
      () => reject(new Error("Location permission denied")),
    );
  });
};
