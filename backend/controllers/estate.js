const axios = require("axios");
const multer = require("multer")
const sharp = require("sharp");
const Estate = require("../models/estate");
const Like = require("../models/like");
const catchAsync = require("../utils/catchAsync");
const QueryHandler = require("../utils/apiFeatures");
const AppError = require("../utils/AppError");

// Utils
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image'))
        cb(null, true)
    else
        cb(new AppError("Only images are allowed", 400), false)
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadEstateImages = upload.array('images', 10);

exports.processEstateImages = catchAsync(async(req, res, next) => {
    // handling iamges
    req.body.images = [];

    await Promise.all(
        req.files.images.map(async (file, idx) => {
            const imageName = `estate-${req.body.title}-${Date.now()}-${idx + 1}.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat("jpeg")
                .toFile(`uploads/estates/${imageName}`)
            
            req.body.images.push(imageName);
        })
    );

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
            estates
        }
    })
})

exports.getEstate = catchAsync(async (req, res, next) => {
    const estateId = req.params.id;
    const estate = await Estate.findById(estateId);

    res.status(200).json({
        status: "success",
        data: {
            estate
        }
    })
})

exports.getUserEstates = catchAsync( async (req, res, next) => {
    const estates = await Estate.find({owner: req.user._id});

    res.status(200).json({
        status: "success",
        results: estates.length,
        data: {
            estates
        }
    })
})

exports.sellEstate = catchAsync(async (req, res, next) => {
    if (!req.body) {
        return next(new AppError("Provide data of estate to sell."))
    }

    if (req.body.likes) req.body.likes = 0;

    const estateData = {
        ...req.body,
        owner: req.user._id
    }

    const newEstate = await Estate.create(estateData);

    res.status(201).json({
        status: "success",
        data: {
            estate: newEstate
        }
    })
})

exports.likeEstate = catchAsync(async (req, res, next) => {
    const estateId = req.params.id;
    const estate = Estate.findById(estateId);

    if (!estate) {
        return next("No estate with this id .. it might be deleted!");
    }

    estate.likes += 1;
    await estate.save({validateBeforeSave: false});

    const newLike = await Like.create({
        estate: estateId,
        user: req.user._id,
        likedAt: Date.now()
    })

    res.status(201).json({
        status: "success",
        data: {
            estate
        }
    })
})

exports.dislikeEstate = catchAsync(async (req, res, next) => {
    const like = await Like.find({
        estate: req.params.id,
        user: req.user.id
    })

    if (!like) {
        return next(new AppError("You didn't like this estate before!"));
    }

    const estate = await Estate.find({
        _id: req.params.id,
        owner: req.user.id
    })

    estate.likes -= 1;
    await estate.save({validateBeforeSave: false})

    await Like.findByIdAndDelete(like._id);

    res.status(204).json({
        status: "success",
        data: null
    })
})

exports.updateEstate = catchAsync(async (req, res, next) => {
    const estateId = req.params.id;
    const userId = req.user._id;

    const estate = await Estate.find({_id: estateId, owner: userId});

    if (!estate) {
        return next(new AppError("Can't find estate or it's not your estate!", 400));
    }

    Estate.updateOne()
    const newEstate = await Estate.findByIdAndUpdate(
        {"_id": estateId}, 
        {$set : req.body}, 
        {new: true, runValidators: true}
    )

    res.status(200).json({
        status: "success",
        data: {
            estate: newEstate
        }
    })

})

exports.deleteEstate = catchAsync(async (req, res, next) => {
    const estateId = req.params.id;
    const estate = await Estate.find({
        _id: estateId,
        owner: req.user._id
    });

    if (!estate) {
        return next(new AppError("Cannot find the estate or it's not yours!"));
    }

    await Estate.findByIdAndDelete(estateId);
    await Like.deleteMany({estate: estateId});

    res.status(204).json({
        status: "success",
        data: null
    })
})

exports.getEstatesWithin = catchAsync(async (req, res, next) => {
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(",");

    const radius = unit == "mi" ? distance / 3963.2 : distance / 6378.1;

    const tours = await Tour.find({ startLocation: {
        $geoWithin: {$centerSphere: [[lng, lat], radius]}
    }})

    console.log(distance , latlng, unit)

    res.status(200).json({
        status: "sucess",
        results: tours.length,
        data: {
            tours
        }
    })
})

exports.getNearestEstates = catchAsync(async (req, res, next) => {
    const {latlng, unit} = req.params;
    const [lat, lng] = latlng.split(",");
    console.log(lat, lng);

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    const nearestEstates = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                // distanceMultiplier: multiplier
            }   
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            nearestEstates
        }
    })
})
