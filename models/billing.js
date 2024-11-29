const mongoose = require("mongoose");

const billing = mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    customerContact: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
    },
    customerAddress: {
      type: String,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Online", "Cash"],
    },
    service: {
      type: String,
      required: true,
    },
    tableNumber: {
      type: String,
    },
    waiter: {
      type: String,
    },
    products: [
      {
        productName: {
          type: String,
          required: true,
        },
        productDesc: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        category: {
          type: String,
          required: true,
        },
        image: {
          type: String,
        },
        type: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    subTotal: {
      type: Number,
      required: true,
    },
    cgstPercentage: {
      type: String,
      required: true,
    },
    cgstAmount: {
      type: String,
      required: true,
    },
    sgstPercentage: {
      type: String,
      required: true,
    },
    sgstAmount: {
      type: String,
      required: true,
    },
    isRoundPositive: {
      type: Boolean,
      reqired: true,
    },
    roundOff: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Paid"],
    },
    billUrl: {
      type: String,
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
      enum: ["Active", "Inactive", "Deleted"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("billing", billing);
