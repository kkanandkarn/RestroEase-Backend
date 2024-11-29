const {
  addCategoryController,
  viewCategoryController,
  viewCategoryByIdController,
  updateCategoryController,
  deleteCategoryController,
} = require("../../controllers/v1");
const express = require("express");
const { dispatcher } = require("../../middleware");
const { PERMISSIONS } = require("../../utils/constant");
const router = express.Router();

router.post("/add", (req, res, next) => {
  dispatcher(req, res, next, addCategoryController, PERMISSIONS.ADD_CATEGORY);
});
router.get("/view", (req, res, next) => {
  dispatcher(req, res, next, viewCategoryController, PERMISSIONS.VIEW_CATEGORY);
});
router.post("/view-by-id", (req, res, next) => {
  dispatcher(
    req,
    res,
    next,
    viewCategoryByIdController,
    PERMISSIONS.VIEW_CATEGORY
  );
});
router.put("/update", (req, res, next) => {
  dispatcher(
    req,
    res,
    next,
    updateCategoryController,
    PERMISSIONS.UPDATE_CATEGORY
  );
});
router.put("/delete", (req, res, next) => {
  dispatcher(
    req,
    res,
    next,
    deleteCategoryController,
    PERMISSIONS.DELETE_CATEGORY
  );
});

module.exports = router;
