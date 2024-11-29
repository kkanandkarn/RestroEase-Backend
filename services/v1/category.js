const { ErrorHandler } = require("../../helper/error-handler");
const {
  SERVER_ERROR,
  CONFLICT,
  NOT_FOUND,
} = require("../../helper/status-codes");
const { category, users, products } = require("../../models");
const { SERVER_ERROR_MSG } = require("../../utils/constant");

const addCategory = async (req) => {
  try {
    const { categoryName } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;

    const checkCategory = await category.findOne({
      category: categoryName,
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });
    if (checkCategory) {
      throw new ErrorHandler(CONFLICT, "Category name already exists");
    }

    await category.create({
      category: categoryName,
      tenantId: tenantId,
      createdBy: userId,
      updatedBy: userId,
    });
    const categories = await category
      .find({
        tenantId: tenantId,
        status: { $ne: "Deleted" },
      })
      .select("_id category status createdAt updatedAt")
      .sort([["updatedAt", -1]]);
    return { message: "Category created successfully", categories: categories };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const viewCategory = async (req) => {
  try {
    const tenantId = req.user.tenantId;
    const categories = await category
      .find({
        tenantId: tenantId,
        status: { $ne: "Deleted" },
      })
      .select("_id category status createdAt updatedAt")
      .sort([["updatedAt", -1]]);
    return { categories: categories };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};
const viewCategoryById = async (req) => {
  try {
    const { id } = req.body;
    const tenantId = req.user.tenantId;
    const categories = await category.findOne({
      _id: id,
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });
    if (!categories) {
      return {};
    }
    return {
      id: categories._id,
      category: categories.category,
      status: categories.status,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
    };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const updateCategory = async (req) => {
  try {
    const { id, categoryName, status } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    const checkCategory = await category.findOne({
      _id: id,
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });
    if (!checkCategory) {
      throw new ErrorHandler(NOT_FOUND, "Category not found");
    }
    const checkCategoryName = await category.findOne({
      category: categoryName,
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });

    if (checkCategoryName && checkCategory.category !== categoryName) {
      throw new ErrorHandler(CONFLICT, "Category name already exists");
    }

    const filter = { _id: id, tenantId: tenantId };
    const update = {
      category: categoryName,
      status: status,
      updatedBy: userId,
      updatedAt: new Date(),
    };

    await category.findOneAndUpdate(filter, update);
    const categories = await category
      .find({
        tenantId: tenantId,
        status: { $ne: "Deleted" },
      })
      .select("_id category status createdAt updatedAt")
      .sort([["updatedAt", -1]]);
    return { message: "Category updated successfully", categories: categories };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};
const deleteCategory = async (req) => {
  try {
    const { id } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    const checkCategory = await category.findOne({
      _id: id,
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });
    if (!checkCategory) {
      throw new ErrorHandler(NOT_FOUND, "Category not found");
    }

    const filter = { _id: id, tenantId: tenantId };
    const update = {
      status: "Deleted",
      updatedBy: userId,
      updatedAt: new Date(),
    };

    await category.findOneAndUpdate(filter, update);
    await products.findOneAndUpdate(
      { category: id, tenantId: tenantId },
      {
        status: "Deleted",
        updatedBy: userId,
        updatedAt: new Date(),
      }
    );
    const categories = await category
      .find({
        tenantId: tenantId,
        status: { $ne: "Deleted" },
      })
      .select("_id category status createdAt updatedAt")
      .sort([["updatedAt", -1]]);

    return { message: "Category deleted successfully", categories: categories };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};
module.exports = {
  addCategory,
  viewCategory,
  viewCategoryById,
  updateCategory,
  deleteCategory,
};
