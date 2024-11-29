const express = require("express");
const router = express.Router();
const auth = require("./auth");
const category = require("./category");
const product = require("./invantory");
const table = require("./table");
const dropdown = require("./dropdown");
const payment = require("./payment");
const billing = require("./billing");
const dashboard = require("./dashboard");
const otp = require("./otp");
const notifications = require("./notifications");

router.use("/auth", auth);
router.use("/category", category);
router.use("/product", product);
router.use("/table", table);
router.use("/dropdown", dropdown);
router.use("/payment", payment);
router.use("/billing", billing);
router.use("/dashboard", dashboard);
router.use("/otp", otp);
router.use("/notifications", notifications);

router.use((req, res, next) => {
  const error = new Error("Invalid API. Make sure to call the correct API.");
  error.status = 404;
  next(error);
});

module.exports = router;
