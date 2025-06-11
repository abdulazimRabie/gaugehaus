const fs = require("fs");
const path = require('path');
const promisify = require("util").promisify;
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const sendEmail = require("../utils/mail");

// Load Emails
// Load HTML templates
const welcomeTemplate = fs.readFileSync(path.join(__dirname, '../views/emails/welcome.html'), 'utf8');
const resetPasswordTemplate = fs.readFileSync(path.join(__dirname, '../views/emails/reset-password.html'), 'utf8');

const signToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    // create user
    let newUser = {
        name: req.body.name, 
        email: req.body.email, 
        password: req.body.password,
        confirmedPassword: req.body.confirmedPassword,
        changedPasswordAt: req.body.changedPasswordAt
    };

    if (req.body.images)
        newUser.images = req.body.images;

    newUser = await User.create(newUser);

    // create jwt
    const token = signToken({email: req.body.email});
    newUser.password = undefined; // don't send password in response
    
    // send welcome email
    try {
        const html = welcomeTemplate.replace('{{username}}', newUser.name);
        console.log(html)
        await sendEmail({
            email: newUser.email,
            subject: "[GaugeHaus] : Welcome to GaugeHaus",
            text: 
            `
            Hi ${newUser.name}
            Thank you for joining GaugeHaus! We're excited to have you on board. Get started by exploring our platform and unlocking powerful features to enhance your experience.
            `,
            html: html
        })
        console.log('Email has been sent')

        // send token
        res.status(201).json({
            status: "success",
            token,
            data: {
                user: newUser
            }
        })
    } catch (error) {
        return next(new AppError("Something went wroing while creating profile, try again", 400));
    }
})

exports.login = catchAsync(async (req, res, next) => {
    // get credentials
    const {email, password} = req.body;
    if (!email || !password)
        return next(new AppError("Email and password must be provided", 400));

    // verify user
    const user = await User.findOne({email}).select("+password");
    console.log("User is trying to login : ", user);
    if (!user || !bcrypt.compare(password, user.password))
        return next("Email / password is wrong")
    
    // create token
    const token = signToken({email});
    user.password = undefined;

    // send response
    res.status(200).json({
        status: "success",
        token,
        data: {
            user
        }
    })
})

exports.protect = catchAsync (async (req, res, next) => {
    // get token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new AppError("You're not logged in!", 401));
    }

    // verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(decoded);
    const user = await User.findOne({email: decoded.email});
    console.log(user);
    if (!user) {
        return next(new AppError("Not authorized to access this route. Log in.", 401));
    }

    // check if he changed password, and verify when this token has been initited
    // const tokenInitiatedAt = decoded.iat;
    // const changedPasswordAt = user.changedPasswordAt.getTime() / 1000;
    // if (changedPasswordAt > tokenInitiatedAt) {
    //     return next(new AppError("Password has changed recently. Log in again", 401));
    // }

    req.user = user;
    // if all fine, go to next middleware
    next();
})

function generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}

exports.forgetPassword = catchAsync(async (req, res, next) => {
    // get email
    const email = req.body.email;
    if (!email) {
        return next(new AppError("No email is provided", 400));
    }

    // verify this email associated with a real user
    const user = await User.findOne({email})
    if(!user) {
        return next(new AppError("No user with this email"));
    }

    console.log("USER WANTS TO RESET PASSWORD: ", user);

    // 1. generate OTP
    // 2. hash OTP
    // 3. set hashed value to database
    const resetOTP = generateOTP(6);
    user.createHashedOTP(resetOTP);
    await user.save({validateBeforeSave: false});

    console.log('OTP : ', resetOTP);
    console.log("hashed OTP : ", user.resetOTP, user.resetOTPExpiresAt);

    try {
        const html = resetPasswordTemplate.replace('{{username}}', user.name).replace('{{otp}}', resetOTP);
        await sendEmail({
            email,
            subject: "[GaugeHaus] : Reset Password OTP",
            text: 
            `
            Reset OTP will be invalid in 10 minutes.
            Use the following OTP to reset password: ${resetOTP}.
            Please ignore this email if it is not you.
            `,
            html
        })

        res.status(200).json({
            status: "success",
            message: `OTP is sent to ${email} successfully.`
        })
    } catch (error) {
        console.log(error)
        return next(new AppError("Somehing wrong happend. Please try again", 400))
    }
    // send otp to email
})

exports.verifyOTP = catchAsync(async (req, res, next) => {
    // verify OTP
    const resetOTP = req.body.otp;
    const email = req.body.email;

    if (!email || !resetOTP) {
        return next(new AppError("Please provide email and OTP to reset password.", 400));
    }
    const hashedOTP = crypto.createHash("sha256").update(resetOTP).digest("hex");
    console.log("hashed OTP :", hashedOTP);
    const user = await User.findOne({
        email, 
        resetOTP: hashedOTP, 
        resetOTPExpiresAt: {$gt: Date.now()}
    });

    if (!user) {
        return next(new AppError("OTP is not valid", 401));
    }

    res.status(200).json({
        status: "sucess",
        data: {
            validOTP: true
        }
    })
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    const {email, password, confirmedPassword} = req.body;
    if (!email || !password || !confirmedPassword) {
        return next(new AppError("Please provide email and new password then confirm password.", 400));
    }

    const user = await User.findOne({email});

    if (!(user.resetOTPExpiresAt > Date.now())) {
        return next(new AppError("OTP has expired. Please generate new one."))
    }

    user.password = password;
    user.confirmedPassword = confirmedPassword;
    user.changedPasswordAt = Date.now() - 1000;

    // remove OTP
    user.resetOTP = undefined;
    user.resetOTPExpiresAt = undefined;
    await user.save(); // run validations

    // sign token
    const token = signToken({email});
    res.status(200).json({
        status: "success",
        message: "Password reseted successfully.",
        token
    })
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    // verify user and ensure that old password is correct
    const {oldPassword, password, confirmedPassword} = req.body;
    if (!oldPassword || !password || !confirmedPassword) {
        return next(new AppError("Please provide old password and new password then confirm new one.", 400))
    }

    console.log("USER Wants to update his password : ", req.user);

    const user = await User.findById(req.user._id).select("+password");
    if (!user || !await bcrypt.compare(oldPassword, user.password)) {
        return next(new AppError("Old password is not correct. Try again"));
    }

    console.log(user);

    // update password
    // update changedPasswordAt
    user.password = password;
    user.confirmedPassword = confirmedPassword;
    user.changedPasswordAt = Date.now() - 1000;
    
    // save document and run validations
    await user.save();

    // login again
    const token = signToken({emai: user.email});

    res.status(200).json({
        status: "success",
        message: "Password has been changed successfully.",
        token
    })
})

exports.logout = (req, res, next) => {}