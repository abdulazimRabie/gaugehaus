const express = require("express");
const estateController = require("../controllers/estate");
const router = express.Router();


router.post("/predict", estateController.predictPrice)

module.exports = router;