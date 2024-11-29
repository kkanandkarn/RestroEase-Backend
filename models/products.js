const mongoose = require("mongoose");

const products = mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    productDesc: {
      type: String,
    },
    price: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "category",
    },
    image: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "non-veg",
      enum: ["veg", "non-veg"],
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

module.exports = mongoose.model("products", products);
