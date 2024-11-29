const {
  addTableNumberController,
  viewTableNumberController,
  viewTableNumberByIdController,
  updateTableNumberController,
  deleteTableNumberController,
} = require("../../controllers/v1");
const express = require("express");
const { dispatcher } = require("../../middleware");
const { PERMISSIONS } = require("../../utils/constant");
const router = express.Router();

router.post("/add", (req, res, next) => {
  dispatcher(
    req,
    res,
    next,
    addTableNumberController,
    PERMISSIONS.ADD_TABLE_NUMBER
  );
});
router.get("/view", (req, res, next) => {
  dispatcher(
    req,
    res,
    next,
    viewTableNumberController,
    PERMISSIONS.VIEW_TABLE_NUMBER
  );
});
router.post("/view-by-id", (req, res, next) => {
  dispatcher(
    req,
    res,
    next,
    viewTableNumberByIdController,
    PERMISSIONS.VIEW_TABLE_NUMBER
  );
});
router.put("/update", (req, res, next) => {
  dispatcher(
    req,
    res,
    next,
    updateTableNumberController,
    PERMISSIONS.UPDATE_TABLE_NUMBER
  );
});
router.put("/delete", (req, res, next) => {
  dispatcher(
    req,
    res,
    next,
    deleteTableNumberController,
    PERMISSIONS.DELETE_TABLE_NUMBER
  );
});

module.exports = router;
