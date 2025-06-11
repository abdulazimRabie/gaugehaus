const Like = require("../models/like");
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.getLikesOf = catchAsync (async(req, res, next) => {
    if(!req.params.id) {
        return next(new AppError("provide estates' id, please!", 400))
    }

    const likesOfEstate = await Like.find({estate: req.params.id});

    const users = [];

    await Promise.all(likesOfEstate.map(async(like) => {
        const user = await User.findById(like.user).select("name username image");
        users.push(user);
    }))

    res.status(200).json({
        status: "success",
        data: {
            users
        }
    })
})