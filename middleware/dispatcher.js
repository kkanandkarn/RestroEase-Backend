const { ErrorHandler } = require("../helper/error-handler");
const { OK, UNAUTHORIZED } = require("../helper/status-codes");
const { users } = require("../models");
const { matchPermission } = require("../utils/match-permission");

/**
 *
 * The dispacter function middleware is the single source for sending the response. This middleware
 * checks if the user is authenticated and if the allowed user has access to the controller.
 *
 * @param {*} req -> Express request object
 * @param {*} res -> Express response object
 * @param {*} next -> Express middleware next function
 * @param {*} func -> Router controller function
 * @param resource -> Resource to Check Permission On
 * @param {*} perm -> Permission to Check
 * @returns -> The final response with the data
 */

const dispatcher = async (req, res, next, func, perm) => {
  try {
    if (perm) {
      const checkPerm = await matchPermission(req, perm);
      if (!checkPerm) throw new ErrorHandler(UNAUTHORIZED, "Not permitted");
    }
    if (req.user && req.user.userId) {
      const user = await users.findOne({ _id: req.user.userId });
      req.user.tenantId = user.tenantId;
    }
    const data = await func(req, res, next);
    if (data) {
      return res
        .status(OK)
        .json({ status: "SUCCESS", statusCode: OK, data: data });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = dispatcher;
