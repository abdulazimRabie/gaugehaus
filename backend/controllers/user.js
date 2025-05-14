const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

function filterFields(rawFields, allowedFields) {
    const updateObject = {};
    allowedFields.forEach(field => {
        if (Object.keys(rawFields).includes(field)) {
            updateObject[field] = rawFields[field];
        }
    })

    return updateObject
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find({active: true});

    res.status(200).json({
        data: {
            users
        }
    })
})

exports.getUser = catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    if(!userId) {
        return next(new AppError("Please provide user ID", 400));
    }

    const user = await User.findById(req.params.id).select("+active");
    if (!user || !user.active) {
        return next(new AppError("No user with this ID or it is deleted account."));
    }

    user.active = undefined;
    res.status(200).json({
        status: "success",
        data: {
            user
        }
    })
})

exports.updateMe = catchAsync(async (req, res, next) => {
    // cannot update password. user update password route to manage this operation
    if (req.body.password || req.body.confirmedPassword) {
        return next(new AppError("You cannot change password using this route. /updatePassword is responsible for that."))
    }

    if (req.body.email) {
        return next(new AppError("You cannot change email. It is uneditable.", 400));
    }

    if (Object.keys(req.body).includes("active")) {
        return next(new AppError("You cannot inactive you account using this route!! /deleteMe is more suitable."))
    }

    // filter fields to be changed
    const allowedFields = ["name", "username", "location", "phoneNumber", "about"]
    const updateObject = filterFields(req.body, allowedFields);

    console.log('UPDATED OBJECT : ', updateObject);

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateObject, {
        runValidators: true,
        new: true
    })

    if (!updatedUser) {
        return next(new AppError("Something went wrong!! Please try again."))
    }

    // return update document
    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    req.user.active = false;
    await req.user.save({validateBeforeSave: false});

    res.status(204).json({
        status: "success",
        data: null
    })
})