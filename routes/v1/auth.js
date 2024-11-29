const express = require("express");
const { dispatcher } = require("../../middleware");
const {
  loginController,
  createUserController,
  viewUserController,
  viewUserByIdController,
  updateUserController,
  deleteUserController,
  getUserByTokenController,
  registerController,
  viewProfileController,
  updateProfileController,
  updatePasswordController,
} = require("../../controllers/v1");
const { PERMISSIONS } = require("../../utils/constant");

const router = express.Router();

router.post("/login", (req, res, next) => {
  dispatcher(req, res, next, loginController);
});
router.post("/register", (req, res, next) => {
  dispatcher(req, res, next, registerController);
});
router.post("/create-user", (req, res, next) => {
  dispatcher(req, res, next, createUserController, PERMISSIONS.CREATE_USER);
});
router.post("/view-user", (req, res, next) => {
  dispatcher(req, res, next, viewUserController, PERMISSIONS.VIEW_USER);
});
router.post("/view-user-by-id", (req, res, next) => {
  dispatcher(req, res, next, viewUserByIdController, PERMISSIONS.VIEW_USER);
});
router.put("/update-user", (req, res, next) => {
  dispatcher(req, res, next, updateUserController, PERMISSIONS.UPDATE_USER);
});
router.put("/delete-user", (req, res, next) => {
  dispatcher(req, res, next, deleteUserController, PERMISSIONS.DELETE_USER);
});
router.get("/get-user-by-token", (req, res, next) => {
  dispatcher(req, res, next, getUserByTokenController);
});
router.get("/view-profile", (req, res, next) => {
  dispatcher(req, res, next, viewProfileController);
});
router.put("/update-profile", (req, res, next) => {
  dispatcher(req, res, next, updateProfileController);
});
router.put("/update-password", (req, res, next) => {
  dispatcher(req, res, next, updatePasswordController);
});

module.exports = router;
