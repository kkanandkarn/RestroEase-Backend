const mongoose = require("mongoose");

const dropdownModel = mongoose.Schema(
  {
    dropdownCode: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive", "Deleted"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("dropdownModel", dropdownModel);
