const Joi = require("joi");
const { ErrorHandler } = require("../helper/error-handler");
const { BAD_GATEWAY } = require("../helper/status-codes");

const schemas = {
  auth_login_post: Joi.object({
    username: Joi.string().required().messages({
      "string.base": "Username must be string",
      "any.required": "Username is required",
    }),
    googleAuth: Joi.boolean().required().messages({
      "boolean.base": "Google Auth must be a boolean.",
      "any.required": "Google Auth is required.",
    }),
    password: Joi.string().when("googleAuth", {
      is: false,
      then: Joi.required().messages({
        "string.base": "Password must be a string.",
        "string.empty": "Password cannot be empty.",
        "any.required": "Password is required.",
      }),
      otherwise: Joi.optional(),
    }),
  }),
  auth_register_post: Joi.object({
    tenantName: Joi.string().required().messages({
      "string.base": "Tenant name must be a string.",
      "string.empty": "Tenant name cannot be empty.",
      "any.required": "Tenant name is required.",
    }),
    tenantLogo: Joi.string().uri().required().messages({
      "string.base": "Photo must be a valid URI string.",
      "string.uri": "Photo must be a valid URI.",
      "any.required": "Tenant logo is required.",
    }),
    name: Joi.string().required().messages({
      "string.base": "Name must be a string.",
      "string.empty": "Name cannot be empty.",
      "any.required": "Name is required.",
    }),
    username: Joi.string().email().required().messages({
      "string.base": "Username must be a string.",
      "string.email": "Username must be a valid email address.",
      "string.empty": "Username cannot be empty.",
      "any.required": "Username is required.",
    }),
    googleAuth: Joi.boolean().required().messages({
      "boolean.base": "Google Auth must be a boolean.",
      "any.required": "Google Auth is required.",
    }),
    password: Joi.string()
      .min(8)
      .when("googleAuth", {
        is: false,
        then: Joi.required().messages({
          "string.base": "Password must be a string.",
          "string.empty": "Password cannot be empty.",
          "string.min": "Password must be at least 8 characters long.",
          "any.required": "Password is required.",
        }),
        otherwise: Joi.optional(),
      }),

    contact: Joi.string()
      .pattern(/^\d{10}$/)
      .messages({
        "string.pattern.base": "Contact must be a valid 10-digit number.",
      }),
    address: Joi.string().allow("").messages({
      "string.base": "Address must be a string.",
    }),
    employeeId: Joi.string().allow("").messages({
      "string.base": "Employee ID must be a string.",
    }),
    photo: Joi.string().uri().allow("").messages({
      "string.base": "Photo must be a valid URI string.",
      "string.uri": "Photo must be a valid URI.",
    }),
  }),
  auth_update_password_put: Joi.object({
    username: Joi.string().required().messages({
      "string.base": "Username should be of type text.",
      "string.empty": "Username cannot be empty.",
      "any.required": "Username is required.",
    }),
    password: Joi.string()
      .min(6)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/) // Regex pattern
      .required()
      .messages({
        "string.base": "Password must be a string.",
        "any.required": "Password is required.",
        "string.min": "Password must be at least 6 characters long.",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one special character, and one number.",
      }),
  }),
  category_add_post: Joi.object({
    categoryName: Joi.string().required().messages({
      "string.base": "Category Name must be string",
      "any.required": "Category Name is required",
    }),
  }),
  otp_generate_otp_post: Joi.object({
    username: Joi.string().email().required().messages({
      "string.base": "Username should be of type text.",
      "string.email": "Username must be a valid email address.",
      "string.empty": "Username cannot be empty.",
      "any.required": "Username is required.",
    }),
    method: Joi.string()
      .valid("register", "forgetPassword")
      .required()
      .messages({
        "any.only": "Invalid method.",
        "string.empty": "Method cannot be empty",
        "any.required": "Method is required.",
      }),
  }),
  otp_verify_otp_post: Joi.object({
    username: Joi.string().email().required().messages({
      "string.base": "Username should be of type text.",
      "string.email": "Username must be a valid email address.",
      "string.empty": "Username cannot be empty.",
      "any.required": "Username is required.",
    }),
    otp: Joi.string().length(4).required().messages({
      "string.base": "OTP must be a string.",
      "string.length": "OTP must be exactly 4 characters long.",
      "any.required": "OTP is required.",
    }),
  }),
  category_view_by_id_post: Joi.object({
    id: Joi.string()
      .length(24)
      .pattern(/^[a-f\d]{24}$/i)
      .required()
      .messages({
        "string.base": "Category ID must be a string",
        "string.length": "Invalid Category Id",
        "string.pattern.base": "Invalid Category Id",
        "any.required": "Category ID is required",
      }),
  }),
  category_update_put: Joi.object({
    id: Joi.string()
      .length(24)
      .pattern(/^[a-f\d]{24}$/i)
      .required()
      .messages({
        "string.base": "Category ID must be a string",
        "string.length": "Invalid Category Id",
        "string.pattern.base": "Invalid Category Id",
        "any.required": "Category ID is required",
      }),
    categoryName: Joi.string().required().messages({
      "string.base": "Category Name must be string",
      "any.required": "Category Name is required",
    }),
    status: Joi.string().valid("Active", "Hold").required().messages({
      "any.only": "Status must be either 'Active' or 'Hold'",
      "any.required": "Status is required",
    }),
  }),
  category_delete_put: Joi.object({
    id: Joi.string()
      .length(24)
      .pattern(/^[a-f\d]{24}$/i)
      .required()
      .messages({
        "string.base": "Category ID must be a string",
        "string.length": "Invalid Category Id",
        "string.pattern.base": "Invalid Category Id",
        "any.required": "Category ID is required",
      }),
  }),
  product_add_post: Joi.object({
    productName: Joi.string().required().messages({
      "string.base": "Product Name must be string",
      "any.required": "Product Name is required",
    }),
    productDesc: Joi.string().optional().messages({
      "string.base": "Product Desc must be string",
    }),
    price: Joi.number()
      .positive() // Ensures the number is positive
      .required()
      .messages({
        "number.base": "Price must be a number",
        "number.positive": "Price must be a positive number",
      }),
    categoryId: Joi.string()
      .length(24)
      .pattern(/^[a-f\d]{24}$/i)
      .required()
      .messages({
        "string.base": "Category must be a string",
        "string.length": "Invalid Category",
        "string.pattern.base": "Invalid Category",
        "any.required": "Category is required",
      }),
    image: Joi.string().required().messages({
      "string.base": "Product image must be an url",
      "any.required": "Product image is required",
    }),
    type: Joi.string().valid("veg", "non-veg").required().messages({
      "any.only": "type must be either 'Veg' or 'Non veg'",
      "any.required": "Type is required",
    }),
  }),
  product_view_by_id_post: Joi.object({
    id: Joi.string()
      .length(24)
      .pattern(/^[a-f\d]{24}$/i)
      .required()
      .messages({
        "string.base": "Product ID must be a string",
        "string.length": "Invalid Product Id",
        "string.pattern.base": "Invalid Product Id",
        "any.required": "Product ID is required",
      }),
  }),
  product_update_put: Joi.object({
    id: Joi.string()
      .length(24)
      .pattern(/^[a-f\d]{24}$/i)
      .required()
      .messages({
        "string.base": "Product ID must be a string",
        "string.length": "Invalid Product Id",
        "string.pattern.base": "Invalid Product Id",
        "any.required": "Product ID is required",
      }),
    productName: Joi.string().required().messages({
      "string.base": "Product Name must be string",
      "any.required": "Product Name is required",
    }),
    productDesc: Joi.string().optional().messages({
      "string.base": "Product Desc must be string",
    }),
    price: Joi.number()
      .positive() // Ensures the number is positive
      .required()
      .messages({
        "number.base": "Price must be a number",
        "number.positive": "Price must be a positive number",
      }),
    categoryId: Joi.string()
      .length(24)
      .pattern(/^[a-f\d]{24}$/i)
      .required()
      .messages({
        "string.base": "Category ID must be a string",
        "string.length": "Invalid Category Id",
        "string.pattern.base": "Invalid Category Id",
        "any.required": "Category ID is required",
      }),
    image: Joi.string().required().messages({
      "string.base": "Product image must be an url",
      "any.required": "Product image is required",
    }),
    type: Joi.string().valid("veg", "non-veg").required().messages({
      "any.only": "type must be either 'Veg' or 'Non veg'",
      "any.required": "Type is required",
    }),
    status: Joi.string().valid("Active", "Hold").required().messages({
      "any.only": "Status must be either 'Active' or 'Hold'",
      "any.required": "Status is required",
    }),
  }),
  product_delete_put: Joi.object({
    id: Joi.string()
      .length(24)
      .pattern(/^[a-f\d]{24}$/i)
      .required()
      .messages({
        "string.base": "Product ID must be a string",
        "string.length": "Invalid Product Id",
        "string.pattern.base": "Invalid Product Id",
        "any.required": "Product ID is required",
      }),
  }),
  auth_create_user_post: Joi.object({
    name: Joi.string().required().min(3).max(30).messages({
      "string.base": "Name must be a string.",
      "any.required": "Name is required.",
      "string.min": "Name must be at least 3 characters long.",
      "string.max": "Name must be at most 30 characters long.",
    }),

    username: Joi.string().alphanum().min(3).max(30).required().messages({
      "string.base": "Username must be a string.",
      "any.required": "Username is required.",
      "string.min": "Username must be at least 3 characters long.",
      "string.max": "Username must be at most 30 characters long.",
      "string.alphanum": "Username must only contain alphanumeric characters.",
    }),

    password: Joi.string()
      .min(6)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/) // Regex pattern
      .required()
      .messages({
        "string.base": "Password must be a string.",
        "any.required": "Password is required.",
        "string.min": "Password must be at least 6 characters long.",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one special character, and one number.",
      }),

    contact: Joi.string()
      .optional()
      .pattern(/^[0-9]{10}$/)
      .messages({
        "string.base": "Contact must be a string.",
        "string.pattern.base": "Contact must be a valid 10-digit phone number.",
      }),

    address: Joi.string().optional().min(5).max(100).messages({
      "string.base": "Address must be a string.",
      "string.min": "Address must be at least 5 characters long.",
      "string.max": "Address must be at most 100 characters long.",
    }),

    employeeId: Joi.string().optional().alphanum().min(5).max(20).messages({
      "string.base": "Employee ID must be a string.",
      "string.min": "Employee ID must be at least 5 characters long.",
      "string.max": "Employee ID must be at most 20 characters long.",
      "string.alphanum":
        "Employee ID must only contain alphanumeric characters.",
    }),

    photo: Joi.string().optional().uri().messages({
      "string.base": "Photo URL must be a string.",
    }),
    role: Joi.string().required().messages({
      "string.base": "Role must be a string.",
      "any.required": "Role is required.",
    }),
  }),
  auth_view_user_by_id_post: Joi.object({
    id: Joi.string()
      .length(24)
      .pattern(/^[a-f\d]{24}$/i)
      .required()
      .messages({
        "string.base": "ID must be a string",
        "string.length": "Invalid Id",
        "string.pattern.base": "Invalid  Id",
        "any.required": "ID is required",
      }),
  }),
  auth_update_user_put: Joi.object({
    id: Joi.string()
      .length(24)
      .pattern(/^[a-f\d]{24}$/i)
      .required()
      .messages({
        "string.base": "ID must be a string",
        "string.length": "Invalid Id",
        "string.pattern.base": "Invalid  Id",
        "any.required": "ID is required",
      }),
    name: Joi.string().required().min(3).max(30).messages({
      "string.base": "Name must be a string.",
      "any.required": "Name is required.",
      "string.min": "Name must be at least 3 characters long.",
      "string.max": "Name must be at most 30 characters long.",
    }),

    username: Joi.string().email().required().messages({
      "string.base": "Username should be of type text.",
      "string.email": "Username must be a valid email address.",
      "string.empty": "Username cannot be empty.",
      "any.required": "Username is required.",
    }),
    password: Joi.string()
      .min(6)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/) // Regex pattern
      .optional() // Make it optional
      .messages({
        "string.base": "Password must be a string.",
        "string.min": "Password must be at least 6 characters long.",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one special character, and one number.",
      }),

    contact: Joi.string()
      .optional()
      .pattern(/^[0-9]{10}$/)
      .messages({
        "string.base": "Contact must be a string.",
        "string.pattern.base": "Contact must be a valid 10-digit phone number.",
      }),

    address: Joi.string().optional().min(5).max(100).messages({
      "string.base": "Address must be a string.",
      "string.min": "Address must be at least 5 characters long.",
      "string.max": "Address must be at most 100 characters long.",
    }),

    employeeId: Joi.string().optional().alphanum().min(5).max(20).messages({
      "string.base": "Employee ID must be a string.",
      "string.min": "Employee ID must be at least 5 characters long.",
      "string.max": "Employee ID must be at most 20 characters long.",
      "string.alphanum":
        "Employee ID must only contain alphanumeric characters.",
    }),

    photo: Joi.string().optional().uri().messages({
      "string.base": "Photo URL must be a string.",
    }),
    role: Joi.string().required().messages({
      "string.base": "Role must be a string.",
      "any.required": "Role is required.",
    }),
    status: Joi.string().required().messages({
      "string.base": "Status must be a string.",
      "any.required": "Status is required.",
    }),
  }),
  auth_delete_user_put: Joi.object({
    id: Joi.string()
      .length(24)
      .pattern(/^[a-f\d]{24}$/i)
      .required()
      .messages({
        "string.base": "ID must be a string",
        "string.length": "Invalid  Id",
        "string.pattern.base": "Invalid  Id",
        "any.required": "ID is required",
      }),
  }),

  table_add_post: Joi.object({
    tableNumber: Joi.string().required().messages({
      "string.base": "Table Number must be string",
      "any.required": "Table Number is required",
    }),
  }),

  table_view_by_id_post: Joi.object({
    id: Joi.string()
      .length(24)
      .pattern(/^[a-f\d]{24}$/i)
      .required()
      .messages({
        "string.base": "Table Number ID must be a string",
        "string.length": "Invalid Table Number ID",
        "string.pattern.base": "Invalid Table Number ID",
        "any.required": "Table Number ID is required",
      }),
  }),

  table_update_put: Joi.object({
    id: Joi.string()
      .length(24)
      .pattern(/^[a-f\d]{24}$/i)
      .required()
      .messages({
        "string.base": "Table Number ID must be a string",
        "string.length": "Invalid Table Number ID",
        "string.pattern.base": "Invalid Table Number ID",
        "any.required": "Table Number ID is required",
      }),
    tableNumber: Joi.string().required().messages({
      "string.base": "Table Number must be an string",
      "any.required": "Table Number is required",
    }),
    status: Joi.string().valid("Active", "Hold").required().messages({
      "any.only": "Status must be either 'Active' or 'Hold'",
      "any.required": "Status is required",
    }),
  }),

  table_delete_put: Joi.object({
    id: Joi.string()
      .length(24)
      .pattern(/^[a-f\d]{24}$/i)
      .required()
      .messages({
        "string.base": "Table Number ID must be a string",
        "string.length": "Invalid Table Number ID",
        "string.pattern.base": "Invalid Table Number ID",
        "any.required": "Table Number ID is required",
      }),
  }),
  dropdown_dropdown_value_post: Joi.object({
    dropdownCode: Joi.string().required().messages({
      "string.base": "Dropdown code must be string",
      "any.required": "Dropdown code is required",
    }),
  }),
  payment_create_payment_post: Joi.object({
    customerName: Joi.string().required().messages({
      "string.base": "Customer name must be string",
      "string.empty": "Customer name is required.",
      "any.required": "Customer name is required.",
    }),

    customerContact: Joi.number().required().messages({
      "number.base": "Customer contact must be a number.",
      "any.required": "Customer contact is required.",
    }),

    customerEmail: Joi.string().email().optional().messages({
      "string.email": "Please provide a valid email address.",
    }),

    customerAddress: Joi.string()
      .optional()
      .when("service", {
        is: "Delivery",
        then: Joi.string().required().messages({
          "any.required": "Customer address is required for Delivery service.",
        }),
      })
      .messages({
        "string.base": "Customer address must be a string.",
      }),

    paymentMethod: Joi.string().valid("Online", "Cash").required().messages({
      "any.only": 'Payment method must be either "Online" or "Cash".',
      "string.base": "Payment method must be string",
      "string.empty": "Payment method is required.",
      "any.required": "Payment method is required.",
    }),

    service: Joi.string()
      .valid("Delivery", "Fine Dining", "Take Away")
      .required()
      .messages({
        "any.only":
          'Service must be either "Delivery", "Fine Dining", "Take Away".',
        "string.base": "Service must be string",
        "string.empty": "Service is required.",
        "any.required": "Service is required.",
      }),

    table: Joi.string()
      .optional()
      .when("service", {
        is: "Fine Dining",
        then: Joi.string().required().messages({
          "string.base": "Table Number must be a string",
          "any.required": "Table Number is required for Fine Dining service.",
        }),
      }),
    waiter: Joi.string()
      .optional()
      .when("service", {
        is: "Fine Dining",
        then: Joi.string().required().messages({
          "string.base": "Waiter Name must be a string",
          "any.required": "Waiter Name is required for Fine Dining service.",
        }),
      }),

    cartProducts: Joi.array()
      .min(1)
      .items(
        Joi.object({
          productName: Joi.string().required().messages({
            "string.base": "Product name must be a string.",
            "string.empty": "Product name is required.",
            "any.required": "Product name is required.",
          }),

          productDesc: Joi.string().required().messages({
            "string.base": "Product description must be a string.",
            "string.empty": "Product description is required.",
            "any.required": "Product description is required.",
          }),

          price: Joi.number().required().messages({
            "number.base": "Price must be a valid number.",
            "any.required": "Price is required.",
          }),

          category: Joi.string().required().messages({
            "string.base": "Category must be a string.",
            "string.empty": "Category is required.",
            "any.required": "Category is required.",
          }),

          image: Joi.string().optional().messages({
            "string.base": "Image URL must be a valid string.",
          }),

          type: Joi.string().required().messages({
            "string.base": "Product type must be a string.",
            "string.empty": "Product type is required.",
            "any.required": "Product type is required.",
          }),

          quantity: Joi.number().required().messages({
            "number.base": "Quantity must be a number.",
            "any.required": "Quantity is required.",
          }),
        })
      )
      .required()
      .messages({
        "array.base": "Cart products must be an array of objects.",
        "array.min": "At least one product must be included in the cart.",
        "any.required": "Cart products cannot be empty.",
      }),

    subTotal: Joi.number().required().messages({
      "number.base": "Subtotal must be a number.",
      "any.required": "Subtotal is required.",
    }),

    cgstPercentage: Joi.string().required().messages({
      "string.base": "CGST percentage must be a string.",
      "any.required": "CGST percentage is required.",
    }),

    cgstAmount: Joi.string().required().messages({
      "string.base": "CGST amount must be a string.",
      "any.required": "CGST amount is required.",
    }),

    sgstPercentage: Joi.string().required().messages({
      "string.base": "SGST percentage must be a string.",
      "any.required": "SGST percentage is required.",
    }),

    sgstAmount: Joi.string().required().messages({
      "string.base": "SGST amount must be a string.",
      "any.required": "SGST amount is required.",
    }),

    roundOff: Joi.string().required().messages({
      "string.base": "Round-off must be a string.",
      "any.required": "Round-off is required.",
    }),
    isRoundPositive: Joi.boolean().required().messages({
      "boolean.base": "isRoundPositive must be a boolean.",
      "any.required": "isRoundPositive is required.",
    }),

    totalAmount: Joi.number().required().messages({
      "number.base": "Total amount must be a number.",
      "any.required": "Total amount is required.",
    }),
  }),
  payment_verify_payment_post: Joi.object({
    orderId: Joi.string()
      .length(24)
      .pattern(/^[a-f\d]{24}$/i)
      .required()
      .messages({
        "string.base": "Order ID must be a string",
        "string.length": "Invalid Order ID",
        "string.pattern.base": "Invalid Order ID",
        "any.required": "Order ID is required",
      }),
  }),
  billing_get_bill_post: Joi.object({
    id: Joi.string()
      .length(24)
      .pattern(/^[a-f\d]{24}$/i)
      .required()
      .messages({
        "string.base": "ID must be a string",
        "string.length": "Invalid Bill ID",
        "string.pattern.base": "Invalid Bill ID",
        "any.required": "Bill ID is required",
      }),
    exportFlag: Joi.boolean().optional().messages({
      "boolean.base": "Export Flag must be a boolean",
    }),
    exportType: Joi.string().valid("excel", "pdf").optional().messages({
      "string.base": "Export Type must be a string",
      "any.only": "Export Type must be either 'excel' or 'pdf'",
    }),
  }),
  notifications_insert_fcm_token_post: Joi.object({
    authToken: Joi.string().required().messages({
      "string.base": "Auth token must be a string.",
      "any.required": "Auth token is required.",
    }),
    fcmToken: Joi.string().required().messages({
      "string.base": "FCM token must be a string.",
      "any.required": "FCM token is required.",
    }),
  }),

  export: Joi.boolean(),
};

const validator = (req, res, next) => {
  try {
    const key = `${req.path
      .split("/")
      .splice(2)
      .join("_")
      .split("-")
      .join("_")}_${req.method.toLowerCase()}`;

    const schema = schemas[key];
    console.log({ key: key });
    if (!schema) {
      return next();
    } else {
      const { value, error } = schema.validate(req.body);
      if (error) throw new ErrorHandler(BAD_GATEWAY, error.message);
      else next();
    }
  } catch (error) {
    next(error);
  }
};
module.exports = validator;
