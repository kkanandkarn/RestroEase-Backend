const mongoose = require("mongoose");
const { MONGO_URL } = process.env;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URL);
    console.log("Connected to db: ", conn.connection.host);
  } catch (error) {
    console.log("Error connecting db: ", error);
  }
};

module.exports = connectDB;
