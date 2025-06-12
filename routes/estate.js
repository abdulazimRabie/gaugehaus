const express = require("express");
const estateController = require("../controllers/estate");
const estateMiddleware = require("../middlewares/estate");
const authController = require("../controllers/authentication");
const router = express.Router();

// router.post("/predict", estateController.predictPrice)

// Get: all estates
// Post: sell new estate
router
  .route("/")
  .get(estateController.getAllEstates)
  .post(
    authController.protect,
    estateController.uploadEstateImages,
    estateController.processEstateImages,
    estateController.sellEstate,
  );

// Get: user's estates
router.get(
  "/my-estates",
  authController.protect,
  estateController.getMyEstates,
);
router.get(
  "/user/:id",
  authController.protect,
  estateController.getUserEstates,
);

// Get: single estate
// Update, Delete: exist estate
router
  .route("/:id")
  .get(authController.protect, estateController.getEstate)
  .patch(
    authController.protect,
    estateMiddleware.estateChecker,
    estateController.uploadEstateImages,
    estateController.processEstateImages,
    estateController.updateEstate,
  )
  .delete(authController.protect, estateController.deleteEstate);

// Post: like estate
router.post(
  "/like-estate/:id",
  authController.protect,
  estateController.likeEstate,
);

// Post: deslike estate
router.post(
  "/dislike-estate/:id",
  authController.protect,
  estateController.dislikeEstate,
);

// Get: Search estate within
// /estates/within/:distance/center/:latlng/unit/:unit
// Estate.find({location: {$getWithin: {$centerSphere: [[lat, lng], radius]} } })
router.get(
  "/search-within/:distance/center/:latlng/unit/:unit",
  authController.protect,
  estateController.getEstatesWithin,
);

// Get: Nearest estates
router.get(
  "/nearest/:latlng/unit/:unit",
  authController.protect,
  estateController.getNearestEstates,
);

module.exports = router;
