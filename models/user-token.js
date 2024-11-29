const mongoose = require("mongoose");

const userToken = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
    roleId: {
      type: mongoose.Types.ObjectId,
      ref: "roles",
    },
    tenantId: {
      type: mongoose.Types.ObjectId,
      ref: "tenants",
    },
    authToken: {
      type: String,
      required: true,
    },
    fcmToken: {
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

module.exports = mongoose.model("userToken", userToken);
