const mongoose = require("mongoose");

const tenants = mongoose.Schema(
  {
    tenantName: String,
    tenantLogo: String,
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Hold", "Suspended", "Inactive", "Deleted"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("tenants", tenants);
