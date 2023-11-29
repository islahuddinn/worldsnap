const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // Extract the value causing the duplicate field error
  const value = err.message.match(/(["'])(\\?.)*?\1/);

  // Check if a match is found before accessing the value
  const duplicateValue = value ? value[0] : "unknown";

  const message = `Duplicate field value: ${duplicateValue}. Please use another value`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  // Check if the error object has the expected structure
  if (err.errors) {
    // Extract error messages from the errors object
    const errors = Object.values(err.errors).map((error) => error.message);
    const message = `Invalid input data. ${errors.join(", ")}`;
    return new AppError(message, 400, Input - data - is - not - correct, {});
  } else {
    // If the error object doesn't have the expected structure, handle it accordingly
    return new AppError("Invalid input data", 400);
  }
};

const handleJWTError = () =>
  new AppError("Invalid token. Please login again", 401);

const handleTokenExpiredError = () =>
  new AppError("Expired token. Please login again", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    switch (error.name) {
      case "CastError":
        error = handleCastErrorDB(error);
        break;
      case 11000:
      case 11001:
      case "MongooseError":
        error = handleDuplicateFieldsDB(error);
        break;
      case "ValidationError":
        error = handleValidationErrorDB(error);
        break;
      case "JsonWebTokenError":
        error = handleJWTError();
        break;
      case "TokenExpiredError":
        error = handleTokenExpiredError();
        break;
      default:
        // Send detailed error information to the client
        return res.status(error.statusCode).json({
          status: error.status,
          message: error.message,
          statusCode: error.statusCode,
          details: error.errors || null, // Include validation errors
        });
    }

    // Send the standard response for known errors
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      statusCode: error.statusCode,
    });
  }
};
module.exports = (err, req, res, next) => {
  console.error("Incoming Error:", err);
  if (process.env.NODE_ENV !== "test") {
    // Log the error for better debugging
    console.error(err);
  }

  if (process.env.NODE_ENV === "production" && err.name === "Error") {
    // Handle unexpected errors in production more gracefully
    err = new AppError("Something went wrong!", 500);
  }

  sendErrorProd(err, res);
};

// const AppError = require("../utils/appError");

// const handleCastErrorDB = (err) => {
//   const message = `Invalid ${err.path}: ${err.value}`;
//   return new AppError(message, 400, "invalid-input", {});
// };

// const handleDuplicateFieldsDB = (err) => {
//   // Extract the value causing the duplicate field error
//   const value = err.message.match(/(["'])(\\?.)*?\1/);

//   // Check if a match is found before accessing the value
//   const duplicateValue = value ? value[0] : "unknown";

//   const message = `Duplicate field value: ${duplicateValue}. Please use another value`;

//   return new AppError(message, 400, "duplicate-field", {});
// };

// const handleValidationErrorDB = (err) => {
//   // Check if the error object has the expected structure
//   if (err.errors) {
//     // Extract error messages from the errors object
//     const errors = Object.values(err.errors).map((error) => error.message);
//     const message = `Invalid input data. ${errors.join(", ")}`;
//     return new AppError(message, 400, "invalid-input-data", {});
//   } else {
//     // If the error object doesn't have the expected structure, handle it accordingly
//     return new AppError("Invalid input data", 400, "invalid-input", {});
//   }
// };

// const handleJWTError = () =>
//   new AppError("Invalid token. Please login again", 401, "invalid-token", {});

// const handleTokenExpiredError = () =>
//   new AppError("Expired token. Please login again", 401, "token-expired", {});

// const sendErrorDev = (err, res) => {
//   res.status(err.statusCode).json({
//     success: false,
//     status: err.status,
//     message: err.message,
//     errorType: err.errorType,
//     data: err.data,
//     stack: err.stack,
//   });
// };

// const sendErrorProd = (err, res) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "error";

//   if (process.env.NODE_ENV === "development") {
//     sendErrorDev(err, res);
//   } else if (process.env.NODE_ENV === "production") {
//     let error = { ...err };
//     let responseFormat;

//     switch (error.name) {
//       case "CastError":
//         responseFormat = handleCastErrorDB(error);
//         break;
//       case 11000:
//       case 11001:
//       case "MongooseError":
//         responseFormat = handleDuplicateFieldsDB(error);
//         break;
//       case "ValidationError":
//         responseFormat = handleValidationErrorDB(error);
//         break;
//       case "JsonWebTokenError":
//         responseFormat = handleJWTError();
//         break;
//       case "TokenExpiredError":
//         responseFormat = handleTokenExpiredError();
//         break;
//       default:
//         // Send detailed error information to the client
//         responseFormat = {
//           success: false,
//           status: error.status,
//           message: error.message,
//           statusCode: error.statusCode,
//           errorType: error.errorType,
//           data: error.data,
//         };
//     }

//     // Send the standard response for known errors
//     res.status(error.statusCode).json(responseFormat);
//   }
// };

// module.exports = (err, req, res, next) => {
//   console.error("Incoming Error:", err);
//   if (process.env.NODE_ENV !== "test") {
//     // Log the error for better debugging
//     console.error(err);
//   }

//   if (process.env.NODE_ENV === "production" && err.name === "Error") {
//     // Handle unexpected errors in production more gracefully
//     err = new AppError("Something went wrong!", 500, "unknown-error", {});
//   }

//   sendErrorProd(err, res);
// };
