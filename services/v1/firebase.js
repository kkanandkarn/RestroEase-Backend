const { ErrorHandler } = require("../../helper/error-handler");
const { admin } = require("../../helper/firebase-config");
const {
  SERVER_ERROR,
  BAD_GATEWAY,
  UNAUTHORIZED,
} = require("../../helper/status-codes");
const { users } = require("../../models");
const userToken = require("../../models/user-token");
const { SERVER_ERROR_MSG } = require("../../utils/constant");
const jwt = require("jsonwebtoken");
const { messaging } = require("../../helper/firebase-config");
const { formatDateTime } = require("../../utils/time-format");

const insertFcmToken = async (req) => {
  try {
    const { authToken, fcmToken } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    const user = await users.findOne({ _id: userId });
    const roleId = user.role;
    try {
      decoded = jwt.verify(authToken, process.env.JWT_PRIVATE_KEY);
    } catch (err) {
      throw new ErrorHandler(UNAUTHORIZED, "Inavid Auth Token");
    }

    const checkExistance = await userToken.findOne({
      userId: userId,
      status: "Active",
    });
    if (checkExistance) {
      const filter = { userId: userId, status: "Active" };
      const update = {
        authToken: authToken,
        fcmToken: fcmToken,
      };
      await userToken.findOneAndUpdate(filter, update);
    } else {
      await userToken.create({
        userId: userId,
        roleId: roleId,
        tenantId: tenantId,
        authToken: authToken,
        fcmToken: fcmToken,
      });
    }

    return { message: "FCM token inserted successfully." };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};
const removeFcmToken = async (req) => {
  try {
    const userId = req.user.userId;
    const checkExistance = await userToken.findOne({
      userId: userId,
      status: "Active",
    });
    if (checkExistance) {
      const filter = { userId: userId, status: "Active" };
      const update = {
        status: "Inactive",
      };
      await userToken.findOneAndUpdate(filter, update);
    }

    return { message: "FCM token removed successfully." };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const sendPushNotiifcation = async (
  notificationTitle,
  notification,
  userId
) => {
  try {
    console.log("userId: ", userId);
    const user = await userToken.findOne({ userId: userId, status: "Active" });
    console.log("user: ", user);

    if (user) {
      const fcmToken = user.fcmToken;
      const message = {
        notification: {
          title: notificationTitle,
          body: notification,
        },
        token: fcmToken,
      };

      try {
        const response = await messaging.send(message);
        console.log(`Notification sent successfully to ${response}`);
      } catch (error) {
        console.error(`Failed to send notification to ${error}:`, error);
      }
    }

    return true;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

module.exports = {
  insertFcmToken,
  removeFcmToken,
  sendPushNotiifcation,
};
