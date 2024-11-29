const mongoose = require("mongoose");

const globalPermissionMaster = mongoose.Schema(
  {
    permissionName: String,
    parent: String,
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive", "Deleted"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "globalPermissionMaster",
  globalPermissionMaster
);
