import { useState, useEffect } from "react";

const useLocation = () => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoords({ lng: coords.longitude, lat: coords.latitude });
        setLoading(false);
      },
      (err) => {
        setError("Please allow location access to see nearby products");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  return { coords, error, loading };
};

export default useLocation;
