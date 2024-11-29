const crypto = require("crypto");
const { Cashfree } = require("cashfree-pg");
const { ErrorHandler } = require("../../helper/error-handler");
const { SERVER_ERROR, BAD_GATEWAY, OK } = require("../../helper/status-codes");
const { SERVER_ERROR_MSG } = require("../../utils/constant");
const billing = require("../../models/billing");
const services = require("../../models/services");
const tableNumber = require("../../models/table-number");
const {
  products,
  roles,
  notificationTemplate,
  users,
  notification,
} = require("../../models");
const { CASHFREE_APP_ID, CASHFREE_SECRET_KEY } = process.env;
const ejs = require("ejs");
const { getIO } = require("../../utils/socket");
const { sendPushNotiifcation } = require("./firebase");
const { formatDateTime } = require("../../utils/time-format");

const createPayment = async (req) => {
  try {
    const {
      customerName,
      customerContact,
      customerEmail,
      customerAddress = "N/A",
      paymentMethod,
      service,
      table,
      waiter,
      cartProducts = [],
      subTotal,
      cgstPercentage,
      cgstAmount,
      sgstPercentage,
      sgstAmount,
      roundOff,
      isRoundPositive,
      totalAmount,
    } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;

    const newOrder = await billing.create({
      customerName: customerName,
      customerContact: customerContact,
      customerEmail: customerEmail,
      customerAddress: customerAddress,
      paymentMethod: paymentMethod,
      service: service,
      tableNumber: table,
      waiter: waiter,
      products: cartProducts,
      subTotal: subTotal,
      cgstPercentage: cgstPercentage,
      cgstAmount: cgstAmount,
      sgstPercentage: sgstPercentage,
      sgstAmount: sgstAmount,
      roundOff: roundOff,
      isRoundPositive: isRoundPositive,
      totalAmount: totalAmount,
      tenantId: tenantId,
      createdBy: userId,
      updatedBy: userId,
    });

    if (paymentMethod === "Cash") {
      const filter = { _id: newOrder._id, tenantId: tenantId };
      const update = {
        paymentStatus: "Paid",
        updatedBy: userId,
        updatedAt: new Date(),
      };

      await billing.findOneAndUpdate(filter, update);
      await saveNotification(
        newOrder._id,
        formatDateTime(new Date()),
        totalAmount,
        tenantId
      );
      return { message: "Billing Successfull" };
    } else {
      const request = {
        order_amount: totalAmount,
        order_currency: "INR",
        order_id: newOrder._id,
        customer_details: {
          customer_id: await generateCustomerId(),
          customer_phone: customerContact,
          customer_name: customerName,
          customer_email: customerEmail,
        },
      };

      const response = await Cashfree.PGCreateOrder("2023-08-01", request);
      return response.data;
    }
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const verifyPayment = async (req) => {
  try {
    const { orderId } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;

    const filter = { _id: orderId, tenantId: tenantId };
    const update = {
      paymentStatus: "Paid",
      updatedBy: userId,
      updatedAt: new Date(),
    };

    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);

    if (response.status === OK) {
      const bill = await billing.findOne({ _id: orderId, tenantId: tenantId });
      await billing.findOneAndUpdate(filter, update);
      await saveNotification(
        orderId,
        formatDateTime(bill.createdAt),
        bill.totalAmount,
        tenantId
      );
      return { message: "Payment Verified" };
    }
  } catch (error) {
    console.error(error);
    throw new ErrorHandler(BAD_GATEWAY, "Invalid order Id");
  }
};
async function generateCustomerId() {
  try {
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const hash = crypto.createHash("sha256");
    hash.update(uniqueId);
    const orderId = hash.digest("hex");
    return orderId.substr(0, 12);
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
}

async function saveNotification(billNumber, billDate, billAmount, tenantId) {
  try {
    const role = await roles.findOne({ role: "Admin" });
    const adminRoleId = role._id;
    const adminUsers = await users.find({
      status: "Active",
      role: adminRoleId,
      tenantId: tenantId,
    });
    const getNotificationTemplate = await notificationTemplate.findOne({
      notificationName: "NEW-BILL-CREATED",
    });

    const variables = {
      billNumber: billNumber,
      billDate: billDate,
      billAmount: billAmount,
    };

    const notificationTitle = getNotificationTemplate.notificationTitle;
    const notificationBody = await ejs.render(
      getNotificationTemplate.notificationTemplate,
      variables
    );

    await Promise.all(
      await adminUsers.map(async (user) => {
        const Notification = new notification({
          userId: user._id,
          notificationTitle: notificationTitle,
          notification: notificationBody,
          route: getNotificationTemplate.route,
        });
        await Notification.save();

        const io = getIO();

        // io.to(user._id.toString()).emit("notification", Notification);
        // console.log("Notification emitted: ", Notification);
        const unreadCount = await notification.countDocuments({
          userId: user._id,
          isRead: false,
        });
        // Emit the unread count
        io.to(user._id.toString()).emit("notificationCount", unreadCount);
        await sendPushNotiifcation(
          notificationTitle,
          notificationBody,
          user._id
        );
      })
    );
    return true;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
}

module.exports = {
  createPayment,
  verifyPayment,
};
