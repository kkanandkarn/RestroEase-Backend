const { ErrorHandler } = require("../../helper/error-handler");
const { UNAUTHORIZED } = require("../../helper/status-codes");
const {
  getNotifications,
  getUnreadNotifications,
} = require("../../services/v1");

const getNotificationsController = async (req, res, next) => {
  try {
    if (!req.user.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "UNAUTHORIZED");
    }
    const response = await getNotifications(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const getUnreadNotificationsController = async (req, res, next) => {
  try {
    if (!req.user.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "UNAUTHORIZED");
    }
    const response = await getUnreadNotifications(req);
    return response;
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getNotificationsController,
  getUnreadNotificationsController,
};
