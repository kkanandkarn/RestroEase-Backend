const dispatcher = require("./dispatcher");
const handleError = require("./handle-error");
const validator = require("./validator");
const validateToken = require("./auth");
const { morganLogger } = require("./logger");
const validateSocket = require("./socket");

module.exports = {
  handleError,
  dispatcher,
  validator,
  validateToken,
  validateSocket,
  morganLogger,
};
