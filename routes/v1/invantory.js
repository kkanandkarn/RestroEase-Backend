const express = require("express");
const { dispatcher } = require("../../middleware");
const { PERMISSIONS } = require("../../utils/constant");
const {
  addProductController,
  viewProductController,
  viewCategoryByIdController,
  updateProductController,
  deleteProductController,
  viewProductByIdController,
} = require("../../controllers/v1");
const router = express.Router();

router.post("/add", (req, res, next) => {
  dispatcher(req, res, next, addProductController, PERMISSIONS.ADD_PRODUCT);
});
router.post("/view", (req, res, next) => {
  dispatcher(req, res, next, viewProductController, PERMISSIONS.VIEW_PRODUCT);
});
router.post("/view-by-id", (req, res, next) => {
  dispatcher(
    req,
    res,
    next,
    viewProductByIdController,
    PERMISSIONS.VIEW_PRODUCT
  );
});
router.put("/update", (req, res, next) => {
  dispatcher(
    req,
    res,
    next,
    updateProductController,
    PERMISSIONS.UPDATE_PRODUCT
  );
});
router.put("/delete", (req, res, next) => {
  dispatcher(
    req,
    res,
    next,
    deleteProductController,
    PERMISSIONS.DELETE_PRODUCT
  );
});

module.exports = router;
