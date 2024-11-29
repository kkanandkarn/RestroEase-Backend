const { ErrorHandler } = require("../../helper/error-handler");
const { SERVER_ERROR, NOT_FOUND } = require("../../helper/status-codes");
const { tenants } = require("../../models");
const { SERVER_ERROR_MSG } = require("../../utils/constant");

const updateTenant = async (req) => {
  try {
    const { tenantId, tenantName, tenantLogo } = req.body;
    const tenant = await tenants.findOne({ _id: tenantId });
    if (!tenant) {
      throw new ErrorHandler(NOT_FOUND, "Tenant not found.");
    }
    const filter = {
      _id: tenantId,
    };
    const update = {
      tenantName: tenantName,
      tenantLogo: tenantLogo,
    };
    await tenants.findOneAndUpdate(filter, update);
    const updatedTenants = await tenants.find({ status: { $ne: "Deleted" } });
    return {
      message: "Tenant updated successfully",
      tenants: updatedTenants,
    };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};
module.exports = {
  updateTenant,
};
