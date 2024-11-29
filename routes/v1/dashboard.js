const express = require("express");
const { dispatcher } = require("../../middleware");
const { PERMISSIONS } = require("../../utils/constant");
const { dashboardController } = require("../../controllers/v1");

const router = express.Router();

router.get("/dashboard-data", (req, res, next) => {
  dispatcher(req, res, next, dashboardController);
});

module.exports = router;
