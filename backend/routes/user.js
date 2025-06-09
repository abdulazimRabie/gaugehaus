const express = require("express");
const usersControllers = require("../controllers/user");
const authController = require("../controllers/authentication");
const uploadImage = require("../utils/uploadUserImage");
const router = express.Router();

router.get("/", authController.protect, usersControllers.getAllUsers);

router
    .route("/:id")
    .get(authController.protect, usersControllers.getUser)

router.patch("/updateMe", 
    authController.protect,
    uploadImage.uploadUserImage,
    uploadImage.processUserImage,
    usersControllers.updateMe)

router.delete("/deleteMe", authController.protect, usersControllers.deleteMe)

module.exports = router;