const { generateOtp, verifyOtp } = require("../../services/v1");

const generateOtpController = async (req, res, next) => {
  try {
    const response = await generateOtp(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const verifyOtpController = async (req, res, next) => {
  try {
    const response = await verifyOtp(req);
    return response;
  } catch (error) {
    next(error);
  }
};
module.exports = {
  generateOtpController,
  verifyOtpController,
};
