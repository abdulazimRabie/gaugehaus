const axios = require("axios");
const multer = require("multer");
const sharp = require("sharp");
const Estate = require("../models/estate");
const Like = require("../models/like");
const catchAsync = require("../utils/catchAsync");
const QueryHandler = require("../utils/apiFeatures");
const AppError = require("../utils/AppError");
const cloudinary = require("../utils/cloudinary");
// Utils
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new AppError("Only images are allowed", 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadEstateImages = upload.fields([{ name: "images", maxCount: 10 }]);

exports.processEstateImages = catchAsync(async (req, res, next) => {
  // handling iamges
  console.log("Is process estates images running !!!!!!");

  if (req.files.images) {
    console.log("Processing and uploading estate images");
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (file, idx) => {
        const imageName = `estate-${req.body.title || req.estate.title || "untitled-estate"}-${Date.now()}-${idx + 1}`;

        // Process the image with sharp
        const processedImage = await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .toBuffer();

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "estates",
              public_id: imageName,
              format: "jpeg",
            },
            (error, result) => {
              if (error)
                reject(new Error(`Cloudinary upload failed: ${error.message}`));
              resolve(result);
            },
          );
          uploadStream.end(processedImage);
        });

        req.body.images.push(result.secure_url);
      }),
    );
  }

  next();
});

// Controller

exports.getAllEstates = catchAsync(async (req, res, next) => {
  const apiHandlerFeatures = new QueryHandler(Estate, req.query)
    .filter()
    .sort()
    .fieldsLimt()
    .pagination();

  const estates = await apiHandlerFeatures.query;

  res.status(200).json({
    status: "success",
    results: estates.length,
    data: {
      estates,
    },
  });
});

exports.getEstate = catchAsync(async (req, res, next) => {
  const estateId = req.params.id;
  const estate = await Estate.findById(estateId);

  res.status(200).json({
    status: "success",
    data: {
      estate,
    },
  });
});

exports.getUserEstates = catchAsync(async (req, res, next) => {
  const estates = await Estate.find({ owner: req.params.id });

  res.status(200).json({
    status: "success",
    results: estates.length,
    data: {
      estates,
    },
  });
});

exports.getMyEstates = catchAsync(async (req, res, next) => {
  console.log("======================================");
  console.log(req.user);
  const estates = await Estate.find({ owner: req.user._id });

  res.status(200).json({
    status: "success",
    results: estates.length,
    data: {
      estates,
    },
  });
});

exports.sellEstate = catchAsync(async (req, res, next) => {
  if (!req.body) {
    return next(new AppError("Provide data of estate to sell."));
  }

  if (req.body.likes) req.body.likes = 0;

  // Ensure location has coordinates if type is Point
  if (
    req.body.location &&
    req.body.location.type === "Point" &&
    (!req.body.location.coordinates ||
      !Array.isArray(req.body.location.coordinates))
  ) {
    req.body.location.coordinates = [0, 0]; // Default coordinates
  }

  const estateData = {
    ...req.body,
    owner: req.user._id,
    ownerName: req.user.name,
    ownerImage: req.user.image,
  };

  const newEstate = await Estate.create(estateData);

  res.status(201).json({
    status: "success",
    data: {
      estate: newEstate,
    },
  });
});

exports.likeEstate = catchAsync(async (req, res, next) => {
  const estateId = req.params.id;
  let estate = await Estate.findById(estateId);
  let like = await Like.findOne({
    estate: estateId,
    user: req.user._id,
  });

  if (!estate) {
    return next(
      new AppError("No estate with this id .. it might be deleted!", 400),
    );
  }

  if (like) {
    return next(new AppError("Cannot like same estate twice", 400));
  }

  estate.likes += 1;
  await estate.save({ validateBeforeSave: false });

  await Like.create({
    estate: estateId,
    user: req.user._id,
    likedAt: Date.now(),
  });

  res.status(201).json({
    status: "success",
    data: {
      estate,
    },
  });
});

exports.dislikeEstate = catchAsync(async (req, res, next) => {
  const like = await Like.findOne({
    estate: req.params.id,
    user: req.user.id,
  });

  if (!like) {
    return next(new AppError("You didn't like this estate before!"));
  }

  const estate = await Estate.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!estate) {
    return next(new AppError("Cannot find the estate!"));
  }

  console.log(estate);

  estate.likes -= 1;
  await estate.save({ validateBeforeSave: false });

  await Like.findByIdAndDelete(like._id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.updateEstate = catchAsync(async (req, res, next) => {
  const estateId = req.params.id;
  const userId = req.user._id;

  const estate = await Estate.find({ _id: estateId, owner: userId });

  console.log(req.body);

  if (!estate) {
    return next(
      new AppError("Can't find estate or it's not your estate!", 400),
    );
  }

  // Ensure location has coordinates if type is Point
  if (
    req.body.location &&
    req.body.location.type === "Point" &&
    (!req.body.location.coordinates ||
      !Array.isArray(req.body.location.coordinates))
  ) {
    req.body.location.coordinates = [0, 0]; // Default coordinates
  }

  const newEstate = await Estate.findByIdAndUpdate(
    { _id: estateId },
    { $set: req.body },
    { new: true, runValidators: true },
  );

  res.status(200).json({
    status: "success",
    data: {
      estate: newEstate,
    },
  });
});

exports.deleteEstate = catchAsync(async (req, res, next) => {
  const estateId = req.params.id;
  const estate = await Estate.findOne({
    _id: estateId,
    owner: req.user._id,
  });

  if (!estate) {
    return next(new AppError("Cannot find the estate or it's not yours!"));
  }

  await Estate.findByIdAndDelete(estateId);
  await Like.deleteMany({ estate: estateId });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getEstatesWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  console.log(req.params);
  const [lat, lng] = latlng.split(",");

  const radius = unit == "mi" ? distance / 3963.2 : distance / 6378.1;

  const tours = await Estate.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  console.log(distance, latlng, unit);

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getNearestEstates = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  console.log(lat, lng);

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  const nearestEstates = await Estate.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        // distanceMultiplier: multiplier
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      nearestEstates,
    },
  });
});
