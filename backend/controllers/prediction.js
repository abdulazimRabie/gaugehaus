const axois = require("axios");
const Prediction = require("../models/prediction");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.predictPrice = catchAsync(async (req, res, next) => {
    const {
        city,
        property_type,
        furnished,
        delivery_term,
        bedrooms,
        bathrooms,
        area,
        level
    } = req.body;

    // pass them to axios
    const response = await axois.post(process.env.FAST_API_URL, {
        city, property_type, furnished, delivery_term, bedrooms, bathrooms, area, level
    });

    // return the data
    res.status(200).json({
        status: "success",
        data: {
            prediction: response.data
        }
    })

})

exports.savePrediction = catchAsync(async (req, res, next) => {
    const { 
        title, city, propertyType, furnished, deliveryTerm, bedrooms, bathrooms, area, level, price, owner
    } = req.body;

    if (!title || !city || !propertyType || !furnished || !deliveryTerm || !bedrooms || !bathrooms || !area || !level || !level || !price || !owner) {
        return next(new AppError("Please provide all required fields of prediction", 400))
    }

    const prediction = await Prediction.create({
        title,
        city,
        propertyType,
        furnished,
        deliveryTerm,
        bedrooms,
        bathrooms,
        area,
        level,
        price,
        pricePerSqm: req.body.pricePerSqm || price / area,
        owner,
    })

    res.status(201).json({
        status: "success",
        data: {
            prediction
        }
    })
})

exports.getPredictions = catchAsync(async (req, res, next) => {
    const predictions = await Prediction.find({owner: req.user._id});
    res.status(200).json({
        status: "success",
        data: {
            predictions
        }
    })
})

exports.getPrediction = catchAsync(async (req, res, next) => {
    if (!req.params.id) {
        return next(new AppError("Provide id of prediction as a parameter", 400))
    }
    
    const prediction = await Prediction.findById(req.params.id)
    if (!prediction) {
        return next(new AppError("No prediction found", 400));
    }

    res.status(200).json({
        status: "success",
        data: {
            prediction
        }
    })
})

exports.updatePrediction = catchAsync(async (req, res, next) => {
    if (!req.params.id || !req.body.title) {
        return next(new AppError("Please provide both prediction ID and new title.", 400))
    }

    console.log("PREDICTION TO DELETE : ", req.params.id);
    console.log("USER WANTS TO DELETE : ", req.user._id);

    const prediction = await Prediction.findOne({
        _id: req.params.id,
        owner: req.user._id // ensure to update only prediction of logged in user
    });

    if (!prediction) {
        return next(new AppError("Invalid prediction ID or prediction isn't yours.", 400));
    }

    prediction.title = req.body.title;
    await prediction.save({validateBeforeSave: false});

    res.status(200).json({
        status: "success",
        data: {
            prediction
        }
    })
})

exports.deletePrediction = catchAsync(async (req, res, next) => {
    if (!req.params.id) {
        return next(new AppError("Provide id of prediction to delete", 400));
    }

    const prediction = await Prediction.findOneAndDelete({
        _id: req.params.id,
        owner: req.user._id // ensure to delete only prediction of logged in user
    });

    if (!prediction) {
        return next(new AppError("Provide a valid prediction ID and prediction must be yours.", 400));
    }

    res.status(204).json({
        status: "success",
        data: null
    })
})