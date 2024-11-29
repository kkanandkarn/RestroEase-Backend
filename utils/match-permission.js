const { ErrorHandler } = require("../helper/error-handler");
const { UNAUTHORIZED, SERVER_ERROR } = require("../helper/status-codes");
const {
  roles,
  globalPermissionMaster,
  globalRolePermissions,
} = require("../models");
const { SERVER_ERROR_MSG } = require("./constant");

const matchPermission = async (req, permission) => {
  try {
    if (!req.user.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "UNAUTHORIZED");
    }
    const role = req.user.role;
    const Role = await roles.findOne({ role: role });
    const Permission = await globalPermissionMaster.findOne({
      permissionName: permission,
    });

    const roleId = Role._id;
    const permissionId = Permission._id;

    const checkPermission = await globalRolePermissions.findOne({
      role: roleId,
      permission: permissionId,
      status: "Active",
    });

    return checkPermission;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

module.exports = {
  matchPermission,
};
