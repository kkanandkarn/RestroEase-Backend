const { createPayment, verifyPayment } = require("../../services/v1");

const createPaymentController = async (req, res, next) => {
  try {
    const response = await createPayment(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const verifyPaymentController = async (req, res, next) => {
  try {
    const response = await verifyPayment(req);
    return response;
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createPaymentController,
  verifyPaymentController,
};
