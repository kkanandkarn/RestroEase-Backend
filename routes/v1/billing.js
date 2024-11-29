const express = require("express");
const { dispatcher } = require("../../middleware");
const { PERMISSIONS } = require("../../utils/constant");
const {
  getBillsController,
  getBillByIdController,
} = require("../../controllers/v1");
const router = express.Router();

router.post("/get-bills", (req, res, next) => {
  dispatcher(req, res, next, getBillsController, PERMISSIONS.VIEW_BILL);
});

router.post("/get-bill", (req, res, next) => {
  dispatcher(req, res, next, getBillByIdController, PERMISSIONS.VIEW_BILL);
});

module.exports = router;
