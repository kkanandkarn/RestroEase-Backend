const { ErrorHandler } = require("../../helper/error-handler");
const {
  SERVER_ERROR,
  CONFLICT,
  NOT_FOUND,
} = require("../../helper/status-codes");
const { users, orders, tableNumber } = require("../../models"); // Assuming you have these models
const { SERVER_ERROR_MSG } = require("../../utils/constant");

const addTableNumber = async (req) => {
  try {
    const { tableNumber: tableNumberValue } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;

    const checkTableNumber = await tableNumber.findOne({
      tableNumber: tableNumberValue,
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });
    if (checkTableNumber) {
      throw new ErrorHandler(CONFLICT, "Table number already exists");
    }

    await tableNumber.create({
      tableNumber: tableNumberValue,
      tenantId: tenantId,
      createdBy: userId,
      updatedBy: userId,
    });

    const tables = await tableNumber
      .find({
        tenantId: tenantId,
        status: { $ne: "Deleted" },
      })
      .select("_id tableNumber status createdAt updatedAt")
      .sort([["updatedAt", -1]]);

    return { message: "Table number created successfully", tables };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const viewTableNumbers = async (req) => {
  try {
    const tenantId = req.user.tenantId;
    const tables = await tableNumber
      .find({
        tenantId: tenantId,
        status: { $ne: "Deleted" },
      })
      .select("_id tableNumber status createdAt updatedAt")
      .sort([["updatedAt", -1]]);

    return { tables };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const viewTableNumberById = async (req) => {
  try {
    const { id } = req.body;
    const tenantId = req.user.tenantId;

    const table = await tableNumber.findOne({
      _id: id,
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });

    if (!table) {
      return {};
    }

    return {
      id: table._id,
      tableNumber: table.tableNumber,
      status: table.status,
      createdAt: table.createdAt,
      updatedAt: table.updatedAt,
    };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const updateTableNumber = async (req) => {
  try {
    const { id, tableNumber: tableNumberValue, status } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;

    const checkTable = await tableNumber.findOne({
      _id: id,
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });
    if (!checkTable) {
      throw new ErrorHandler(NOT_FOUND, "Table number not found");
    }

    const checkTableNumber = await tableNumber.findOne({
      tableNumber: tableNumberValue,
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });

    if (checkTableNumber && checkTable.tableNumber !== tableNumberValue) {
      throw new ErrorHandler(CONFLICT, "Table number already exists");
    }

    const filter = { _id: id, tenantId: tenantId };
    const update = {
      tableNumber: tableNumberValue,
      status: status,
      updatedBy: userId,
      updatedAt: new Date(),
    };

    await tableNumber.findOneAndUpdate(filter, update);

    const tables = await tableNumber
      .find({
        tenantId: tenantId,
        status: { $ne: "Deleted" },
      })
      .select("_id tableNumber status createdAt updatedAt")
      .sort([["updatedAt", -1]]);

    return { message: "Table number updated successfully", tables };
  } catch (error) {
    if (error.statusCode) {
      console.log("status Code");
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const deleteTableNumber = async (req) => {
  try {
    const { id } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;

    const checkTable = await tableNumber.findOne({
      _id: id,
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });
    if (!checkTable) {
      throw new ErrorHandler(NOT_FOUND, "Table number not found");
    }

    const filter = { _id: id, tenantId: tenantId };
    const update = {
      status: "Deleted",
      updatedBy: userId,
      updatedAt: new Date(),
    };

    await tableNumber.findOneAndUpdate(filter, update);

    const tables = await tableNumber
      .find({
        tenantId: tenantId,
        status: { $ne: "Deleted" },
      })
      .select("_id tableNumber status createdAt updatedAt")
      .sort([["updatedAt", -1]]);

    return { message: "Table number deleted successfully", tables };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

module.exports = {
  addTableNumber,
  viewTableNumbers,
  viewTableNumberById,
  updateTableNumber,
  deleteTableNumber,
};
