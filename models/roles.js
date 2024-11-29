const mongoose = require("mongoose");

const roles = mongoose.Schema(
  {
    role: String,
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Hold", "Suspended", "Deleted"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("roles", roles);
