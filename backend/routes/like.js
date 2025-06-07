const express = require('express')
const likesController = require("../controllers/like");
const authController = require("../controllers/authentication");
const router = express.Router();

router.get("/:id", authController.protect, likesController.getLikesOf)

module.exports = router

