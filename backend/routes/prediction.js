const { Router } = require("express");
const predictionsController = require("../controllers/predictions");
const authController = require("../controllers/authentication");
const router = Router();


router.post("/predict", authController.protect, predictionsController.predictPrice);

module.exports = router;