const { Router } = require("express");
const predictionsController = require("../controllers/prediction");
const authController = require("../controllers/authentication");
const router = Router();

router.post("/predict", authController.protect, predictionsController.predictPrice);
router.post("/save", authController.protect, predictionsController.savePrediction);

router
    .route("/:id")
    .get(authController.protect, predictionsController.getPrediction)
    .patch(authController.protect, predictionsController.updatePrediction)
    .delete(authController.protect, predictionsController.deletePrediction);

router.get("/", authController.protect, predictionsController.getPredictions);

module.exports = router;