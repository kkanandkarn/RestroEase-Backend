const mongoose = require("mongoose");

const otpCount = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    otpCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive", "Deleted"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("otpCount", otpCount);
