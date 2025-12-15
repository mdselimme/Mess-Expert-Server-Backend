const envVars = require("../config/env");
const AppError = require("../errorHelpers/AppError");



const globalErrorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = `Something went wrong!! ${error.message}`;

    console.error('=== Global Error Handler ===');
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);

    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
    } else if (error instanceof Error) {
        statusCode = 500;
        message = error.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        error,
        stack: envVars.NODE_ENV === "development" ? error.stack : null
    })

};

module.exports = globalErrorHandler;
