const express = require("express");
const estateController = require("../controllers/estate");
const authController = require("../controllers/authentication")
const router = express.Router();

router.post("/predict", estateController.predictPrice)

// Get: all estates
// Post: sell new estate
router.route("/")
    .get(estateController.getAllEstates)
    .post(
        authController.protect, 
        estateController.uploadEstateImages,
        estateController.processEstateImages,
        estateController.sellEstate)

// Get: single estate
// Update, Delete: exist estate
router.router("/:id")
    .get(authController.protect, estateController.getEstate)
    .patch(
        authController.protect,
        estateController.uploadEstateImages,
        estateController.processEstateImages,
        estateController.updateEstate)
    .delete(authController.protect, estateController.deleteEstate)

// Get: user's estates
router.get("/my-estates", authController.protect, estateController.getUserEstates)

// Post: like estate
router.post("/like-estate/:id", authController.protect, estateController.likeEstate)

// Post: deslike estate
router.post("/dislike-estate/:id", authController.protect, estateController.dislikeEstate)

// Get: Search estate within
// /estates/within/:distance/center/:latlng/unit/:unit
// Estate.find({location: {$getWithin: {$centerSphere: [[lat, lng], radius]} } })
router.get("/search-within/:distance/center/:lanlng/unit/:unit", 
    authController.protect, 
    estateController.getEstatesWithin)

// Get: Nearest estates
router.get("/nearest/:latlng/unit/:unit",
    authController.protect,
    estateController.getNearestEstates
)

module.exports = router;