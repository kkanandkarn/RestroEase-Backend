const { ErrorHandler } = require("../../helper/error-handler");
const { SERVER_ERROR } = require("../../helper/status-codes");
const { notification } = require("../../models");
const { SERVER_ERROR_MSG } = require("../../utils/constant");
const { getIO } = require("../../utils/socket");

const getNotifications = async (req) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.body;
    const skip = (page - 1) * limit;
    const notifications = await notification
      .find({
        userId: userId,
        status: { $ne: "Deleted" },
      })
      .sort([["createdAt", -1]])
      .skip(skip)
      .limit(parseInt(limit));
    const totalCount = await notification.countDocuments({
      userId: userId,
      status: { $ne: "Deleted" },
    });
    const unreadCount = await notification.countDocuments({
      userId: userId,
      isRead: false,
      status: { $ne: "Deleted" },
    });

    const filter = { userId: userId };
    const update = { isRead: true };
    await notification.updateMany(filter, update);

    // Emit the unread count
    const io = getIO();
    io.to(userId.toString()).emit("notificationCount", 0);

    return {
      notifications: notifications,
      totalCount: totalCount,
      unreadCount: unreadCount,
    };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const getUnreadNotifications = async (req) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.body;
    const skip = (page - 1) * limit;
    const notifications = await notification
      .find({
        userId: userId,
        isRead: false,
        status: { $ne: "Deleted" },
      })
      .sort([["createdAt", -1]])
      .skip(skip)
      .limit(parseInt(limit));
    const totalCount = await notification.countDocuments({
      userId: userId,
      isRead: false,
      status: { $ne: "Deleted" },
    });

    return {
      notifications: notifications,
      totalCount: totalCount,
    };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};
module.exports = {
  getNotifications,
  getUnreadNotifications,
};
