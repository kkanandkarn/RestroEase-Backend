const express = require("express");
const { dispatcher } = require("../../middleware");
const {
  generateOtpController,
  verifyOtpController,
} = require("../../controllers/v1");

const router = express.Router();

router.post("/generate-otp", (req, res, next) => {
  dispatcher(req, res, next, generateOtpController);
});
router.post("/verify-otp", (req, res, next) => {
  dispatcher(req, res, next, verifyOtpController);
});

module.exports = router;
