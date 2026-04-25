const mongoose = require("mongoose");
const dbConnect = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGO_URL);
    console.log(`Database connected at ${con.connection.host}`);
  } catch (error) {
    console.error(`Error:${error.message}`);
    process.exit(1);
  }
};
module.exports = dbConnect;
