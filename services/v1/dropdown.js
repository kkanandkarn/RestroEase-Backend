const { ErrorHandler } = require("../../helper/error-handler");
const { SERVER_ERROR } = require("../../helper/status-codes");
const {
  category,
  roles,
  tableNumber,
  dropdownModel,
  users,
} = require("../../models");
const services = require("../../models/services");
const { SERVER_ERROR_MSG } = require("../../utils/constant");

const dropdown = async (req) => {
  try {
    const { dropdownCode } = req.body;

    const Role = await roles.findOne({
      role: "Waiter",
      status: { $ne: "Deleted" },
    });

    if (dropdownCode === "WAITER_LIST") {
      const waiter = await users.find({
        role: Role._id,
        status: { $ne: "Deleted" },
        tenantId: req.user.tenantId,
      });
      return waiter;
    } else if (dropdownCode === "CATEGORY_LIST") {
      const categories = await category.find({
        status: { $ne: "Deleted" },
        tenantId: req.user.tenantId,
      });

      return categories;
    } else if (dropdownCode === "TABLE_LIST") {
      const table = await tableNumber.find({
        status: { $ne: "Deleted" },
        tenantId: req.user.tenantId,
      });
      return table;
    } else {
      const model = await dropdownModel.findOne({
        dropdownCode: dropdownCode,
        status: { $ne: "Deleted" },
      });

      const models = {
        roles: roles,
        services: services,
      };

      const data = models[model.model].find({ status: "Active" });
      return data;
    }
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};
module.exports = {
  dropdown,
};
