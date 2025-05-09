const express = require("express");
const usersControllers = require("../controllers/user");
const authController = require("../controllers/authentication");
const router = express.Router();

router.get("/", authController.protect, usersControllers.getAllUsers);

module.exports = router;