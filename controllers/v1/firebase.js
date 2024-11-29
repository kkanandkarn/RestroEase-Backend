const { ErrorHandler } = require("../../helper/error-handler");
const { UNAUTHORIZED } = require("../../helper/status-codes");
const { insertFcmToken, removeFcmToken } = require("../../services/v1");

const insertFcmTokenController = async (req, res, next) => {
  try {
    if (!req.user.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "UNAUTHORIZED");
    }
    const response = await insertFcmToken(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const removeFcmTokenController = async (req, res, next) => {
  try {
    if (!req.user.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "UNAUTHORIZED");
    }
    const response = await removeFcmToken(req);
    return response;
  } catch (error) {
    next(error);
  }
};
module.exports = {
  insertFcmTokenController,
  removeFcmTokenController,
};
