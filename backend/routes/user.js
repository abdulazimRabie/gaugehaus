const express = require("express");
const usersControllers = require("../controllers/user");
const authController = require("../controllers/authentication");
const router = express.Router();

router.get("/", authController.protect, usersControllers.getAllUsers);

router
    .route("/:id")
    .get(authController.protect, usersControllers.getUser)

router.patch("/updateMe", authController.protect, usersControllers.updateMe)
router.delete("/deleteMe", authController.protect, usersControllers.deleteMe)

module.exports = router;