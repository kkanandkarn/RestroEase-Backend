const { default: mongoose } = require("mongoose");
const { ErrorHandler } = require("../../helper/error-handler");
const {
  SERVER_ERROR,
  CONFLICT,
  NOT_FOUND,
  BAD_GATEWAY,
} = require("../../helper/status-codes");
const { products, category } = require("../../models");
const { SERVER_ERROR_MSG, STATUS } = require("../../utils/constant");
const {
  convertToExcel,
  generateInventoryPdf,
} = require("../../utils/export-data");
const { formatDateTime } = require("../../utils/time-format");

const addProduct = async (req) => {
  try {
    const { productName, productDesc, price, categoryId, image, type } =
      req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    const checkProduct = await products.findOne({
      productName: productName,
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });
    if (checkProduct) {
      throw new ErrorHandler(CONFLICT, "Product name already exists");
    }
    const checkCategory = await category.findOne({
      _id: categoryId,
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });
    if (!checkCategory) {
      throw new ErrorHandler(NOT_FOUND, "Category not found.");
    }
    if (checkCategory.status === STATUS.HOLD) {
      throw new ErrorHandler(
        BAD_GATEWAY,
        "Category on hold. Cannot add new product."
      );
    }
    await products.create({
      productName: productName,
      productDesc: productDesc,
      price: price,
      category: categoryId,
      image: image,
      type: type,
      tenantId: tenantId,
      createdBy: userId,
      updatedBy: userId,
    });
    const Products = await products
      .find({
        tenantId: tenantId,
        status: { $ne: "Deleted" },
      })
      .populate("category", "category")
      .select(
        "_id productName productDesc price category image type status createdAt updatedAt"
      )
      .sort([["updatedAt", -1]])
      .limit(10);
    const totalCount = await products.countDocuments({
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });

    return {
      message: "Products created successfully.",
      products: Products,
      totalCount,
    };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};
const viewProduct = async (req) => {
  try {
    const tenantId = req.user.tenantId;
    const {
      search,
      filters = [],
      page = 1,
      limit = 10,
      exportFlag = false,
      exportType = "excel",
    } = req.body;

    const searchFilter = {
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    };

    if (exportFlag && exportType === "excel") {
      let Products = await products
        .find(searchFilter)
        .populate("category", "category -_id")
        .select("_id productName productDesc image price type status createdAt")
        .sort([["productName", 1]]);
      if (!Products.length) {
        throw new ErrorHandler(NOT_FOUND, "No products found for report");
      }
      Products = Products.map((product, index) => ({
        ...product.toObject(),
        sr: index + 1,
        price: `\u20B9 ${product.price}`,
        category: product.category.category,
        createdAt: formatDateTime(product.createdAt),
      }));
      const headers = [
        { label: "S.No.", key: "sr" },
        { label: "Product Name", key: "productName" },
        { label: "Product Description", key: "productDesc" },
        { label: "Product Price", key: "price" },
        { label: "Category", key: "category" },
        { label: "Type", key: "type" },
        { label: "Product Image", key: "image" },
        { label: "Status", key: "status" },
        { label: "Date", key: "createdAt" },
      ];

      const fileName = `Product_Report_${tenantId}.xlsx`;

      const fileUrl = await convertToExcel(
        headers,
        Products,
        fileName,
        tenantId
      );
      return fileUrl;
    }

    if (exportFlag && exportType === "pdf") {
      const reportUrl = await generateInventoryPdf(tenantId);
      return reportUrl;
    }

    if (search) {
      searchFilter.$or = [
        { productName: { $regex: search, $options: "i" } },
        { productDesc: { $regex: search, $options: "i" } },
        { price: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ];
    }

    if (filters.length) {
      filters.forEach((filter) => {
        if (filter.category) {
          searchFilter.category = filter.category;
        }
        if (filter.type) {
          searchFilter.type = filter.type;
        }
        if (filter.status) {
          searchFilter.status = filter.status;
        }
      });
    }

    const skip = (page - 1) * limit;

    const Products = await products
      .find(searchFilter)
      .populate("category", "_id category")
      .select(
        "_id productName productDesc price category image type status createdAt updatedAt"
      )
      .sort([["updatedAt", -1]])
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await products.countDocuments(searchFilter);

    return { products: Products, totalCount: totalCount };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};
const viewProductById = async (req) => {
  try {
    const { id } = req.body;
    const tenantId = req.user.tenantId;
    const Products = await products
      .findOne({
        _id: id,
        tenantId: tenantId,
        status: { $ne: "Deleted" },
      })
      .populate("category", "category");
    if (!Products) {
      return {};
    }
    return {
      id: Products._id,
      productName: Products.productName,
      productDesc: Products.productDesc || null,
      price: Products.price,
      category: Products.category,
      image: Products.image,
      type: Products.type,
      status: Products.status,
      createdAt: Products.createdAt,
      updatedAt: Products.updatedAt,
    };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const updateProduct = async (req) => {
  try {
    const {
      id,
      productName,
      productDesc,
      price,
      categoryId,
      image,
      type,
      status,
    } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    const checkProduct = await products.findOne({
      _id: id,
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });
    if (!checkProduct) {
      throw new ErrorHandler(NOT_FOUND, "Product not found");
    }

    const checkCategory = await category.findOne({
      _id: categoryId,
      status: { $ne: "Deleted" },
    });
    if (!checkCategory) {
      throw new ErrorHandler(NOT_FOUND, "Category not found.");
    }

    if (
      checkProduct.category != categoryId &&
      checkCategory.status === STATUS.HOLD
    ) {
      throw new ErrorHandler(
        BAD_GATEWAY,
        "Category on hold. Cannot add new product."
      );
    }

    const checkProductName = await products.findOne({
      productName: productName,
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });

    if (checkProductName && checkProduct.productName !== productName) {
      throw new ErrorHandler(CONFLICT, "Product name already exists");
    }

    const filter = { _id: id, tenantId: tenantId };
    const update = {
      productName: productName,
      productDesc: productDesc,
      price: price,
      category: categoryId,
      image: image,
      type: type,
      status: status,
      updatedBy: userId,
      updatedAt: new Date(),
    };

    await products.findOneAndUpdate(filter, update);
    const Products = await products
      .find({
        tenantId: tenantId,
        status: { $ne: "Deleted" },
      })
      .populate("category", "category")
      .select(
        "_id productName productDesc price category image type status createdAt updatedAt"
      )
      .sort([["updatedAt", -1]])
      .limit(10);
    const totalCount = await products.countDocuments({
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });
    return {
      message: "Product updated successfully.",
      products: Products,
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
const deleteProduct = async (req) => {
  try {
    const { id } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    const checkProduct = await products.findOne({
      _id: id,
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });
    if (!checkProduct) {
      throw new ErrorHandler(NOT_FOUND, "Product not found");
    }

    const filter = { _id: id, tenantId: tenantId };
    const update = {
      status: "Deleted",
      updatedBy: userId,
      updatedAt: new Date(),
    };

    await products.findOneAndUpdate(filter, update);

    const Products = await products
      .find({
        tenantId: tenantId,
        status: { $ne: "Deleted" },
      })
      .populate("category", "category")
      .select(
        "_id productName productDesc price category image type status createdAt updatedAt"
      )
      .sort([["updatedAt", -1]]);
    return { message: "Product deleted successfully.", products: Products };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

module.exports = {
  addProduct,
  viewProduct,
  viewProductById,
  updateProduct,
  deleteProduct,
};
