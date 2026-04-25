const handleSellerRegister = async () => {
  // Ask browser for GPS coordinates
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const formData = {
      name,
      email,
      password,
      role: "seller",
      location: {
        type: "Point",
        coordinates: [pos.coords.longitude, pos.coords.latitude],
        address: addressInput, // a text field the seller fills in
      },
    };
    const user = await register(formData);
    navigate("/seller/dashboard");
  });
};
