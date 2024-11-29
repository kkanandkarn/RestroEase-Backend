const billing = require("./billing");
const category = require("./category");
const dropdownModel = require("./dropdownModel");
const globalPermissionMaster = require("./global-permission-master");
const globalRolePermissions = require("./global-role-permissions");
const products = require("./products");
const roles = require("./roles");
const tableNumber = require("./table-number");
const tenants = require("./tenants");
const users = require("./users");
const otp = require("./otp");
const otpCount = require("./otp-count");
const notification = require("./notification");
const notificationTemplate = require("./notification-template");

module.exports = {
  globalPermissionMaster,
  globalRolePermissions,
  roles,
  tenants,
  users,
  category,
  products,
  tableNumber,
  dropdownModel,
  billing,
  otp,
  otpCount,
  notification,
  notificationTemplate,
};
