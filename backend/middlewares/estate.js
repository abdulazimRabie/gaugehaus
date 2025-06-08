const Estate = require("../models/estate");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");


exports.estateChecker = catchAsync(async (req, res, next) => {
    const estateId = req.params.id;
    if (!estateId) {
        return next(AppError("Please provide estate's id !", 400));
    }
    
    const estate = await Estate.findById(estateId);
    if (!estate) {
        return next(AppError("There is no estate with this id", 400));
    }

    req.estate = estate;
    next();
})