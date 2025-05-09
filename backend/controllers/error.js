module.exports = (error, req, res, next) => {
    console.log("Global error handling");
    console.log("Error: ", error);
    error.statusCode = error.statusCode || 500;

    res.status(error.statusCode).json({
        error,
        status: error.status,
        message: error.message,
        stack: error.stack
    })

    next(error);
}