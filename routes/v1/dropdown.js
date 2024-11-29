const express = require("express");
const { dispatcher } = require("../../middleware");
const { PERMISSIONS } = require("../../utils/constant");
const { dropdownController } = require("../../controllers/v1");
const router = express.Router();

router.post("/dropdown-value", (req, res, next) => {
  dispatcher(req, res, next, dropdownController);
});

module.exports = router;
