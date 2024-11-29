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
} = require("./auth");
const { getBillsController, getBillByIdController } = require("./billing");
const {
  addCategoryController,
  viewCategoryController,
  viewCategoryByIdController,
  updateCategoryController,
  deleteCategoryController,
} = require("./category");
const { dashboardController } = require("./dashboard");
const { dropdownController } = require("./dropdown");
const {
  insertFcmTokenController,
  removeFcmTokenController,
} = require("./firebase");
const {
  getNotificationsController,
  getUnreadNotificationsController,
} = require("./notifications");
const { generateOtpController, verifyOtpController } = require("./otp");
const {
  createPaymentController,
  verifyPaymentController,
} = require("./payment");
const {
  addProductController,
  viewProductController,
  viewProductByIdController,
  updateProductController,
  deleteProductController,
} = require("./products");
const {
  addTableNumberController,
  viewTableNumberController,
  viewTableNumberByIdController,
  updateTableNumberController,
  deleteTableNumberController,
} = require("./table-number");

module.exports = {
  loginController,
  addCategoryController,
  viewCategoryController,
  viewCategoryByIdController,
  updateCategoryController,
  deleteCategoryController,
  addProductController,
  viewProductController,
  viewProductByIdController,
  updateProductController,
  deleteProductController,
  createUserController,
  viewUserController,
  viewUserByIdController,
  updateUserController,
  deleteUserController,
  addTableNumberController,
  viewTableNumberController,
  viewTableNumberByIdController,
  updateTableNumberController,
  deleteTableNumberController,
  dropdownController,
  getUserByTokenController,
  createPaymentController,
  verifyPaymentController,
  getBillsController,
  getBillByIdController,
  dashboardController,
  generateOtpController,
  verifyOtpController,
  registerController,
  viewProfileController,
  updateProfileController,
  getNotificationsController,
  insertFcmTokenController,
  removeFcmTokenController,
  getUnreadNotificationsController,
  updatePasswordController,
};
