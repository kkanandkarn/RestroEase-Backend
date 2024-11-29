const mongoose = require("mongoose");

const tableNumber = mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
    },
    tenantId: {
      type: mongoose.Types.ObjectId,
      ref: "tenants",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
    updatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Hold", "Inactive", "Deleted"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("tableNumber", tableNumber);
