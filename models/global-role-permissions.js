const mongoose = require("mongoose");

const globalRolePermissions = mongoose.Schema(
  {
    role: {
      type: mongoose.Types.ObjectId,
      ref: "roles",
    },
    permission: {
      type: mongoose.Types.ObjectId,
      ref: "globalPermissionMaster",
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive", "Deleted"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("globalRolePermissions", globalRolePermissions);
