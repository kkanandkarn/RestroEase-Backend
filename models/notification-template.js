const mongoose = require("mongoose");

const notificationTemplate = mongoose.Schema(
  {
    notificationName: {
      type: String,
      required: true,
    },
    notificationTitle: {
      type: String,
      requred: true,
    },
    notificationTemplate: {
      type: String,
      requred: true,
    },
    route: {
      type: String,
      requred: true,
    },
    access: {
      type: mongoose.Types.ObjectId,
      ref: "roles",
    },

    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive", "Deleted"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notificationTemplate", notificationTemplate);
