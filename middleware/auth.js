const jwt = require("jsonwebtoken");
module.exports = async function (req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  let user = { isAuth: false };
  req.user = user;
  if (!token || token == "null" || token == null) return next();

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  } catch (err) {
    return next();
  }

  if (!decoded) return next();

  user = { ...user, isAuth: true, ...decoded };
  req.user = user;
  return next();
};
