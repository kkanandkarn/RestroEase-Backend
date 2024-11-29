const jwt = require("jsonwebtoken");
module.exports = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error("Authentication error"));

  jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, user) => {
    if (err) return next(new Error("Authentication error"));
    socket.user = user;
    next();
  });
};
