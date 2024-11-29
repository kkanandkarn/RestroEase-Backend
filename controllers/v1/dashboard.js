const { ErrorHandler } = require("../../helper/error-handler");
const { BAD_GATEWAY, UNAUTHORIZED } = require("../../helper/status-codes");
const { adminDashboard } = require("../../services/v1");

const dashboardController = async (req, res, next) => {
  try {
    if (!req.user.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "UNAUTHORIZED");
    }
    const userRole = req.user.role;
    if (userRole === "Admin") {
      return adminDashboard(req);
    } else {
      throw new ErrorHandler(UNAUTHORIZED, "UNAUTHORIZED");
    }
  } catch (error) {
    next(error);
  }
};
module.exports = {
  dashboardController,
};
