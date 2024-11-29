const { ErrorHandler } = require("../../helper/error-handler");
const { UNAUTHORIZED } = require("../../helper/status-codes");
const {
  login,
  createUser,
  viewUser,
  viewUserById,
  updateUser,
  deleteUser,
  getUserByToken,
  register,
  viewProfile,
  updateProfile,
  updatePassword,
} = require("../../services/v1");

const loginController = async (req, res, next) => {
  try {
    const response = await login(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const registerController = async (req, res, next) => {
  try {
    const response = await register(req);
    return response;
  } catch (error) {
    next(error);
  }
};

const createUserController = async (req, res, next) => {
  try {
    const response = await createUser(req);
    return response;
  } catch (error) {
    next(error);
  }
};

const viewUserController = async (req, res, next) => {
  try {
    const response = await viewUser(req);
    return response;
  } catch (error) {
    next(error);
  }
};

const viewUserByIdController = async (req, res, next) => {
  try {
    const response = await viewUserById(req);
    return response;
  } catch (error) {
    next(error);
  }
};

const updateUserController = async (req, res, next) => {
  try {
    const response = await updateUser(req);
    return response;
  } catch (error) {
    next(error);
  }
};

const deleteUserController = async (req, res, next) => {
  try {
    const response = await deleteUser(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const getUserByTokenController = async (req, res, next) => {
  try {
    if (!req.user.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "UNAUTHORIZED");
    }
    const response = await getUserByToken(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const viewProfileController = async (req, res, next) => {
  try {
    if (!req.user.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "UNAUTHORIZED");
    }
    const response = await viewProfile(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const updateProfileController = async (req, res, next) => {
  try {
    if (!req.user.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "UNAUTHORIZED");
    }
    const response = await updateProfile(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const updatePasswordController = async (req, res, next) => {
  try {
    const response = await updatePassword(req);
    return response;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginController,
  createUserController,
  viewUserController,
  viewUserByIdController,
  updateUserController,
  deleteUserController,
  getUserByTokenController,
  registerController,
  viewProfileController,
  updateProfileController,
  updatePasswordController,
};
