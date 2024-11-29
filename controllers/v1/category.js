const {
  addCategory,
  viewCategory,
  viewCategoryById,
  updateCategory,
  deleteCategory,
} = require("../../services/v1");

const addCategoryController = async (req, res, next) => {
  try {
    const response = await addCategory(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const viewCategoryController = async (req, res, next) => {
  try {
    const response = await viewCategory(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const viewCategoryByIdController = async (req, res, next) => {
  try {
    const response = await viewCategoryById(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const updateCategoryController = async (req, res, next) => {
  try {
    const response = await updateCategory(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const deleteCategoryController = async (req, res, next) => {
  try {
    const response = await deleteCategory(req);
    return response;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addCategoryController,
  viewCategoryController,
  viewCategoryByIdController,
  updateCategoryController,
  deleteCategoryController,
};
