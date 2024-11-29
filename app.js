const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const { Cashfree } = require("cashfree-pg");
const cloudinary = require("cloudinary").v2;
const { Server } = require("socket.io");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const { CASHFREE_APP_ID, CASHFREE_SECRET_KEY } = process.env;
connectDB();

const app = express();
const v1 = require("./routes/v1");
const {
  handleError,
  validator,
  validateToken,
  morganLogger,
  validateSocket,
} = require("./middleware");
const { init } = require("./utils/socket");

app.use("/", express.static("public"));

app
  .use(morganLogger)
  .use(cors())
  .use(
    bodyParser.urlencoded({
      limit: "100mb",
      extended: true,
      parameterLimit: 5000,
    })
  )
  .use(bodyParser.json({ limit: "100mb" }));

app.use(validateToken);
app.use(validator);

Cashfree.XClientId = CASHFREE_APP_ID;
Cashfree.XClientSecret = CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

app.use("/v1", v1);

app.use((err, req, res, next) => {
  handleError(err, res);
});

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
const io = init(server);

io.use(validateSocket);
io.on("connection", (socket) => {
  console.log("A user connected");
  const userId = socket.user.userId;
  socket.join(userId);
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
