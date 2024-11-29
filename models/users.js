const mongoose = require("mongoose");

const users = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    contact: {
      type: String,
    },
    address: {
      type: String,
    },
    employeeId: {
      type: String,
    },
    photo: {
      type: String,
    },
    googleAuth: {
      type: Boolean,
      required: true,
    },

    role: {
      type: mongoose.Types.ObjectId,
      ref: "roles",
    },
    tenantId: {
      type: mongoose.Types.ObjectId,
      ref: "tenants",
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Hold", "Suspended", "Inactive", "Deleted"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", users);
