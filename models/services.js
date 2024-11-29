const mongoose = require("mongoose");

const services = mongoose.Schema(
  {
    service: String,
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive", "Deleted"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("services", services);
