const mongoose = require("mongoose");

const notifications = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
    notificationTitle: {
      type: String,
      requred: true,
    },
    notification: {
      type: String,
      requred: true,
    },
    route: {
      type: String,
      requred: true,
    },
    isRead: { type: Boolean, default: false },

    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive", "Deleted"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notifications", notifications);
