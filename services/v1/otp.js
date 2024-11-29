const crypto = require("crypto");
const { otpCount, otp, users, roles } = require("../../models");
const {
  MAX_OTP_COUNT_TIME,
  RESEND_OTP_COUNT,
  SERVER_ERROR_MSG,
  OTP_EXPIRE,
  OTP_MAX_ATTEMPT,
} = require("../../utils/constant");
const {
  BAD_GATEWAY,
  SERVER_ERROR,
  CONFLICT,
  NOT_FOUND,
  MAX_REQUEST,
  PERMISSION_DENIED,
} = require("../../helper/status-codes");
const { ErrorHandler } = require("../../helper/error-handler");
const path = require("path");
const ejs = require("ejs");
const { sendMail } = require("../../utils/mail");

const generateOtp = async (req) => {
  try {
    const { name, username, method } = req.body;
    await validateUser(username, method);
    let otpAttempt = 0;
    const checkOtpCount = await otpCount.findOne({
      username: username,
      status: "Active",
    });

    if (checkOtpCount) {
      otpAttempt = checkOtpCount.otpCount;
      const createdAt = new Date(checkOtpCount.createdAt);
      const currentTime = new Date();
      const timeDifference = (currentTime - createdAt) / (1000 * 60);
      if (timeDifference < MAX_OTP_COUNT_TIME) {
        if (otpAttempt >= RESEND_OTP_COUNT) {
          throw new ErrorHandler(BAD_GATEWAY, "Maximum otp reached");
        }
      }
    }
    const otpValue = await generateOTP(4);

    await otp.create({
      username: username,
      otp: otpValue,
    });

    otpAttempt = otpAttempt + 1;

    if (!checkOtpCount) {
      await otpCount.create({
        username: username,
        otpCount: otpAttempt,
      });
    }
    if (checkOtpCount) {
      const filter = {
        status: "Active",
        username: username,
      };
      const update = {
        otpCount: otpAttempt,
        updatedAt: new Date(),
      };
      await otpCount.findOneAndUpdate(filter, update);
    }

    const user = await users.findOne({ username: username });

    const templatePath = path.join(
      __dirname,
      "../../templates/otp-template.ejs"
    );

    const data = {
      username: name ?? user.name,
      otp: otpValue,
    };
    const htmlContent = await ejs.renderFile(templatePath, data);
    const subject =
      method === "register"
        ? "OTP for registration"
        : "OTP for update password.";
    await sendMail(username, subject, htmlContent);
    return { message: "OTP Sent Successfully." };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const verifyOtp = async (req) => {
  try {
    const { username, otp: otpValue } = req.body;
    let otpAttempt = 0;
    const checkOtp = await otp
      .findOne({
        status: "Active",
        username: username,
      })
      .sort({ createdAt: -1 });

    if (!checkOtp) {
      throw new ErrorHandler(MAX_REQUEST, "No generated otp found.");
    }
    if (checkOtp.isUsed) {
      throw new ErrorHandler(MAX_REQUEST, "OTP Expired");
    }
    const createdAt = new Date(checkOtp.createdAt);
    const currentTime = new Date();
    const timeDifference = (currentTime - createdAt) / (1000 * 60);
    if (timeDifference > OTP_EXPIRE) {
      throw new ErrorHandler(MAX_REQUEST, "OTP Expired");
    }
    otpAttempt = checkOtp.attempts;
    if (otpAttempt >= OTP_MAX_ATTEMPT) {
      throw new ErrorHandler(MAX_REQUEST, "Maximum Attempt Reached.");
    }
    if (checkOtp.otp !== otpValue) {
      otpAttempt = otpAttempt + 1;
      const filter = {
        _id: checkOtp._id,
      };
      const update = {
        attempts: otpAttempt,
      };
      await otp.findOneAndUpdate(filter, update);
      throw new ErrorHandler(BAD_GATEWAY, "Invalid OTP");
    }

    if (checkOtp.otp === otpValue) {
      await otp.findOneAndUpdate(
        { _id: checkOtp._id },
        { isUsed: true, updatedAt: new Date() }
      );
      await otpCount.findOneAndUpdate(
        { username: username },
        { status: "Inactive" }
      );
    }

    return { message: "OTP Verifed Successfully." };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

async function generateOTP(length = 4) {
  const otp = crypto.randomInt(Math.pow(10, length - 1), Math.pow(10, length));
  return otp.toString().padStart(length, "0");
}

async function validateUser(username, method) {
  try {
    if (method === "register") {
      const user = await users.findOne({ username: username });
      if (user) {
        throw new ErrorHandler(CONFLICT, "User already exists.");
      }
    }
    if (method === "forgetPassword") {
      const user = await users.findOne({
        username: username,
        googleAuth: false,
        status: { $ne: "Deleted" },
      });
      if (!user) {
        throw new ErrorHandler(NOT_FOUND, "User not found.");
      }
      const role = await roles.findOne({ role: "Admin" });
      if (user.role.toString() !== role._id.toString()) {
        throw new ErrorHandler(
          BAD_GATEWAY,
          "Contact you Administrator to update password."
        );
      }
    }
    return true;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
}
async function validateOtp(username) {
  try {
    const verify = await otp
      .findOne({ status: "Active", username: username })
      .sort({ createdAt: -1 });
    if (verify) {
      if (verify.isUsed) {
        const createdAt = new Date(verify.createdAt);
        const currentTime = new Date();
        const timeDifference = (currentTime - createdAt) / (1000 * 60);

        if (timeDifference > OTP_EXPIRE) {
          throw new ErrorHandler(PERMISSION_DENIED, "OTP Expired");
        }
        return true;
      } else {
        throw new ErrorHandler(
          PERMISSION_DENIED,
          "Please verify otp to continue"
        );
      }
    } else {
      throw new ErrorHandler(
        PERMISSION_DENIED,
        "Please verify otp to continue"
      );
    }
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
}

module.exports = {
  generateOtp,
  verifyOtp,
  validateOtp,
};
