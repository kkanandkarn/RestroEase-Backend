const { getBills, getBillById } = require("../../services/v1");

const getBillsController = async (req, res, next) => {
  try {
    const response = await getBills(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const getBillByIdController = async (req, res, next) => {
  try {
    const response = await getBillById(req);
    return response;
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getBillsController,
  getBillByIdController,
};
