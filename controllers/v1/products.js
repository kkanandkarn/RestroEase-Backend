const {
  addProduct,
  viewProduct,
  viewProductById,
  updateProduct,
  deleteProduct,
} = require("../../services/v1");

const addProductController = async (req, res, next) => {
  try {
    const response = await addProduct(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const viewProductController = async (req, res, next) => {
  try {
    const response = await viewProduct(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const viewProductByIdController = async (req, res, next) => {
  try {
    const response = await viewProductById(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const updateProductController = async (req, res, next) => {
  try {
    const response = await updateProduct(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const deleteProductController = async (req, res, next) => {
  try {
    const response = await deleteProduct(req);
    return response;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addProductController,
  viewProductController,
  viewProductByIdController,
  updateProductController,
  deleteProductController,
};
