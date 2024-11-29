const jwt = require("jsonwebtoken");
const { JWT_PRIVATE_KEY } = process.env;
module.exports = function (id, role) {
  return jwt.sign({ userId: id, role: role }, JWT_PRIVATE_KEY);
};
