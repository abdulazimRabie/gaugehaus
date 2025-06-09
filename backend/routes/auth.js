const express = require("express");
const authcontroller = require("../controllers/authentication");
const uploadImage = require("../utils/uploadUserImage");
const router = express.Router();

// Sign in
router.post("/signin", 
    uploadImage.uploadUserImage,
    uploadImage.processUserImage,
    authcontroller.signup);

// Login
router.post("/login", authcontroller.login);

// Forget password
router.post("/forgetPassword", authcontroller.forgetPassword);

// Verify password
router.post("/verifyOTP", authcontroller.verifyOTP)

// Reset password
router.post("/resetPassword", authcontroller.resetPassword);

// Update password
router.post("/updatePassword", authcontroller.protect, authcontroller.updatePassword);

module.exports = router;