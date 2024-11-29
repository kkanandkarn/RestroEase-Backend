const {
  addTableNumber,
  viewTableNumbers,
  viewTableNumberById,
  updateTableNumber,
  deleteTableNumber,
} = require("../../services/v1");

const addTableNumberController = async (req, res, next) => {
  try {
    const response = await addTableNumber(req);
    return response;
  } catch (error) {
    next(error);
  }
};

const viewTableNumberController = async (req, res, next) => {
  try {
    const response = await viewTableNumbers(req);
    return response;
  } catch (error) {
    next(error);
  }
};

const viewTableNumberByIdController = async (req, res, next) => {
  try {
    const response = await viewTableNumberById(req);
    return response;
  } catch (error) {
    next(error);
  }
};

const updateTableNumberController = async (req, res, next) => {
  try {
    const response = await updateTableNumber(req);
    return response;
  } catch (error) {
    next(error);
  }
};

const deleteTableNumberController = async (req, res, next) => {
  try {
    const response = await deleteTableNumber(req);
    return response;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTableNumberController,
  viewTableNumberController,
  viewTableNumberByIdController,
  updateTableNumberController,
  deleteTableNumberController,
};
