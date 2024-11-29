const {
  createPaymentController,
  verifyPaymentController,
} = require("../../controllers/v1");
const express = require("express");
const { dispatcher } = require("../../middleware");
const { PERMISSIONS } = require("../../utils/constant");
const router = express.Router();

router.post("/create-payment", (req, res, next) => {
  dispatcher(req, res, next, createPaymentController, PERMISSIONS.ADD_BILL);
});
router.post("/verify-payment", (req, res, next) => {
  dispatcher(req, res, next, verifyPaymentController, PERMISSIONS.ADD_BILL);
});

module.exports = router;
