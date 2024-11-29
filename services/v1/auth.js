const { ErrorHandler } = require("../../helper/error-handler");
const {
  SERVER_ERROR,
  BAD_GATEWAY,
  CONFLICT,
  NOT_FOUND,
  UNAUTHORIZED,
} = require("../../helper/status-codes");
const {
  users,
  roles,
  tenants,
  globalRolePermissions,
  notificationTemplate,
} = require("../../models");
const { SERVER_ERROR_MSG, STATUS } = require("../../utils/constant");
const Token = require("../../utils/token");
const { hashPassword, compare } = require("../../utils/hash");
const { validateOtp } = require("./otp");
const mongoose = require("mongoose");
const { updateTenant } = require("./tenant");
const notification = require("../../models/notification");
const { getIO } = require("../../utils/socket");
const { formatDateTime } = require("../../utils/time-format");
const ejs = require("ejs");
const hash = require("../../utils/hash");

const login = async (req) => {
  try {
    const { username, password, googleAuth } = req.body;
    const user = await users.findOne({ username: username }).populate("role");
    if (!user) {
      throw new ErrorHandler(BAD_GATEWAY, "Invalid username or password");
    }

    if (user.googleAuth && !googleAuth) {
      throw new ErrorHandler(BAD_GATEWAY, "Invalid username or password");
    }

    const tenant = await tenants.findOne({ _id: user.tenantId });

    if (!googleAuth) {
      const checkPassword = await compare(user.password, password);
      if (!checkPassword) {
        throw new ErrorHandler(BAD_GATEWAY, "Invalid username or password");
      }
    }

    if (user.status === STATUS.SUSPENDED || user.status === STATUS.DELETED) {
      throw new ErrorHandler(
        UNAUTHORIZED,
        "Account suspended. Contact your admin for further details."
      );
    }

    const token = await Token(user._id, user.role.role);

    return {
      user: {
        userId: user._id,
        username: user.username,
        role: user.role.role,
        status: user.status,
      },
      tenant: {
        tenantId: tenant._id,
        tenantName: tenant.tenantName,
        tenantLogo: tenant.tenantLogo,
      },
      token: token,
    };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const register = async (req) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      tenantName,
      tenantLogo,
      name,
      username,
      googleAuth,
      password,
      contact,
      address,
      employeeId,
      photo,
    } = req.body;

    if (!googleAuth) {
      await validateOtp(username);
    }

    const user = await users.findOne({ username });
    if (user) {
      throw new ErrorHandler(CONFLICT, "User Already exists.");
    }

    const role = await roles.findOne({ role: "Admin" });
    let hashedPassword = "";
    if (!googleAuth) {
      hashedPassword = await hashPassword(password);
    }

    const tenant = await tenants.create(
      [
        {
          tenantName: tenantName,
          tenantLogo: tenantLogo,
        },
      ],
      { session }
    );

    await users.create(
      [
        {
          name: name,
          username: username,
          password: hashedPassword,
          contact: contact,
          address: address,
          employeeId: employeeId,
          photo: photo,
          googleAuth: googleAuth,
          role: role._id,
          tenantId: tenant[0]._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return { message: "Register successful" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const getUserByToken = async (req) => {
  try {
    const userId = req.user.userId;
    const user = await users.findOne({ _id: userId }).populate("role");
    if (!user) {
      throw new ErrorHandler(BAD_GATEWAY, "User not found.");
    }

    const tenant = await tenants.findOne({ _id: user.tenantId });

    const token = await Token(user._id, user.role.role);

    return {
      user: {
        userId: user._id,
        username: user.username,
        role: user.role.role,
        status: user.status,
      },
      tenant: {
        tenantId: tenant._id,
        tenantName: tenant.tenantName,
        tenantLogo: tenant.tenantLogo,
      },
      token: token,
    };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const createUser = async (req) => {
  try {
    const {
      name,
      username,
      password,
      contact,
      address,
      employeeId,
      photo,
      role,
    } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;

    const checkUsername = await users.findOne({ username: username });
    if (checkUsername) {
      throw new ErrorHandler(CONFLICT, "Username already exists.");
    }

    const checkRole = await roles.findOne({
      _id: role,
      status: { $ne: "Deleted" },
    });
    if (!checkRole) {
      throw new ErrorHandler(NOT_FOUND, "Role not found.");
    }

    if (checkRole.status === STATUS.HOLD) {
      throw new ErrorHandler(BAD_GATEWAY, "Role on hold. Cannot add new user.");
    }

    const hashedPassword = await hashPassword(password);

    await users.create({
      name: name,
      username: username,
      password: hashedPassword,
      contact: contact,
      address: address,
      employeeId: employeeId,
      photo: photo,
      role: role,
      tenantId: tenantId,
      createdBy: userId,
      updatedBy: userId,
    });

    const Users = await users
      .find({
        tenantId: tenantId,
        status: { $ne: "Deleted" },
      })
      .populate("role", "role")
      .select(
        "_id name username contact address employeeId photo role status createdAt updatedAt"
      )
      .sort([["updatedAt", -1]]);

    return { message: "User created successfully", users: Users };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const viewUser = async (req) => {
  try {
    const tenantId = req.user.tenantId;
    const { search, filters = [], page = 1, limit = 10 } = req.body;
    const searchFilter = {
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    };
    if (search) {
      searchFilter.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { contact: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }
    if (filters.length) {
      filters.forEach((filter) => {
        if (filter.role) {
          searchFilter.role = filter.role;
        }
        if (filter.status) {
          searchFilter.status = filter.status;
        }
      });
    }

    const skip = (page - 1) * limit;

    const Users = await users
      .find(searchFilter)
      .populate("role", "_id role")
      .select(
        "_id name username contact address employeeId photo role status createdAt updatedAt"
      )
      .sort([["updatedAt", -1]])
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await users.countDocuments(searchFilter);

    return { users: Users, totalCount: totalCount };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const viewUserById = async (req) => {
  try {
    const { id } = req.body;
    const tenantId = req.user.tenantId;
    const User = await users
      .findOne({
        _id: id,
        tenantId: tenantId,
        status: { $ne: "Deleted" },
      })
      .populate("role", "role");
    if (!User) {
      throw new ErrorHandler(NOT_FOUND, "No user found.");
    }

    return {
      id: User._id,
      name: User.name,
      username: User.username,
      contact: User.contact,
      address: User.address,
      employeeId: User.employeeId,
      photo: User.photo,
      role: User.role,
      status: User.status,
      createdAt: User.createdAt,
      updatedAt: User.updatedAt,
    };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const updateUser = async (req) => {
  try {
    const {
      id,
      name,
      username,
      password,
      contact,
      address,
      employeeId,
      photo,
      role,
      status,
    } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;

    const checkUser = await users.findOne({
      _id: id,
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });
    if (!checkUser) {
      throw new ErrorHandler(NOT_FOUND, "User not found.");
    }

    const checkUsername = await users.findOne({ username: username });
    if (checkUsername && checkUser.username !== username) {
      throw new ErrorHandler(CONFLICT, "Username already exists.");
    }

    let hashedPassword = checkUser.password;
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    const checkRole = await roles.findOne({
      _id: role,
      status: { $ne: "Deleted" },
    });
    if (!checkRole) {
      throw new ErrorHandler(NOT_FOUND, "Role not found.");
    }

    if (checkRole.status === STATUS.HOLD && checkUser.role !== role) {
      throw new ErrorHandler(BAD_GATEWAY, "Role on hold. Cannot add new user.");
    }

    const filter = { _id: id, tenantId: tenantId };
    const update = {
      name: name,
      username: username,
      password: hashedPassword,
      contact: contact,
      address: address,
      employeeId: employeeId,
      photo: photo,
      role: role,
      status: status,
      updatedBy: userId,
      updatedAt: new Date(),
    };

    await users.findOneAndUpdate(filter, update);

    const Users = await users
      .find({
        tenantId: tenantId,
        status: { $ne: "Deleted" },
      })
      .populate("role", "role")
      .select(
        "_id name username contact address employeeId photo role status createdAt updatedAt"
      )
      .sort([["updatedAt", -1]]);

    return { message: "User updated successfully", users: Users };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const deleteUser = async (req) => {
  try {
    const { id } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    const checkUser = await users.findOne({
      _id: id,
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });
    if (!checkUser) {
      throw new ErrorHandler(NOT_FOUND, "User not found");
    }

    const filter = { _id: id, tenantId: tenantId };
    const update = {
      status: "Deleted",
      updatedBy: userId,
      updatedAt: new Date(),
    };

    await users.findOneAndUpdate(filter, update);

    const Users = await users
      .find({
        tenantId: tenantId,
        status: { $ne: "Deleted" },
      })
      .populate("role", "role")
      .select(
        "_id name username contact address employeeId photo role status createdAt updatedAt"
      )
      .sort([["updatedAt", -1]]);

    return { message: "User deleted successfully", users: Users };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const viewProfile = async (req) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const tenantId = req.user.tenantId;
    const data = await users
      .findOne({ _id: userId })
      .populate("role", "role")
      .select(
        "_id name username contact address employeeId photo role status createdAt updatedAt"
      );
    const resposne = data.toObject();
    if (userRole === "Admin") {
      const tenant = await tenants
        .findOne({ _id: tenantId })
        .select("tenantName tenantLogo");
      resposne.tenant = tenant;
    }

    return resposne;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const updateProfile = async (req) => {
  try {
    const { name, contact, address, employeeId, photo } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const tenantId = req.user.tenantId;

    const user = await users.findOne({
      _id: userId,
    });
    if (!user) {
      throw new ErrorHandler(NOT_FOUND, "User not found.");
    }

    const filter = { _id: userId };
    const update = {
      name: name,
      contact: contact,
      address: address,
      employeeId: employeeId,
      photo: photo,
      updatedBy: userId,
      updatedAt: new Date(),
    };

    await users.findOneAndUpdate(filter, update);

    const userData = await users
      .findOne({ _id: userId })
      .populate("role", "role")
      .select(
        "_id name username contact address employeeId photo role status createdAt updatedAt"
      );

    return { message: "Profile updated successfully", user: userData };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const updatePassword = async (req) => {
  try {
    const { username, password } = req.body;
    const user = await users.findOne({
      username: username,
      googleAuth: false,
      status: { $ne: "Deleted" },
    });
    if (!user) {
      throw new ErrorHandler(NOT_FOUND, "User not found.");
    }
    const role = await roles.findOne({ role: "Admin" });
    console.log(user.role, role._id);
    if (user.role.toString() !== role._id.toString()) {
      console.log("not mathed");
      throw new ErrorHandler(
        BAD_GATEWAY,
        "Contact you Administrator to update password."
      );
    }

    await validateOtp(username);
    const hashedPassword = await hashPassword(password);
    await users.findOneAndUpdate(
      { _id: user._id },
      { password: hashedPassword, updatedAt: new Date() }
    );
    return { message: "Password Updated Successfully" };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

module.exports = {
  login,
  register,
  createUser,
  viewUser,
  viewUserById,
  updateUser,
  deleteUser,
  getUserByToken,
  viewProfile,
  updateProfile,
  updatePassword,
};
