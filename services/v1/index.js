const {
  login,
  createUser,
  viewUser,
  viewUserById,
  updateUser,
  deleteUser,
  getUserByToken,
  register,
  viewProfile,
  updateProfile,
  updatePassword,
} = require("./auth");
const { getBills, getBillById } = require("./billing");
const {
  addCategory,
  viewCategory,
  viewCategoryById,
  updateCategory,
  deleteCategory,
} = require("./category");
const { adminDashboard } = require("./dashboard");
const { dropdown } = require("./dropdown");
const { insertFcmToken, removeFcmToken } = require("./firebase");
const {
  addProduct,
  viewProduct,
  viewProductById,
  updateProduct,
  deleteProduct,
} = require("./inventory");
const { getNotifications, getUnreadNotifications } = require("./notifications");
const { generateOtp, verifyOtp } = require("./otp");
const { createPayment, verifyPayment } = require("./payments");
const {
  addTableNumber,
  viewTableNumbers,
  viewTableNumberById,
  updateTableNumber,
  deleteTableNumber,
} = require("./table-number");

module.exports = {
  login,
  addCategory,
  viewCategory,
  viewCategoryById,
  updateCategory,
  deleteCategory,
  addProduct,
  viewProduct,
  viewProductById,
  updateProduct,
  deleteProduct,
  createUser,
  viewUser,
  viewUserById,
  updateUser,
  deleteUser,
  addTableNumber,
  viewTableNumbers,
  viewTableNumberById,
  updateTableNumber,
  deleteTableNumber,
  dropdown,
  getUserByToken,
  createPayment,
  verifyPayment,
  getBills,
  getBillById,
  adminDashboard,
  generateOtp,
  verifyOtp,
  register,
  viewProfile,
  updateProfile,
  getNotifications,
  insertFcmToken,
  removeFcmToken,
  getUnreadNotifications,
  updatePassword,
};
