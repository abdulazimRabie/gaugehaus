const mongoose = require("mongoose");
const validateCity = require("../utils/validateCity");

const PredictionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Give title for the prediction"]
    },
    city: {
        type: String,
        required: [true, "Predicted Estate must have location"],
        validate: {
            validator: async function() {
                return await validateCity(this.city);
            },
            message: "City must be from valid citits only."
        },
    },
    propertyType: {
        type: String,
        required: [true, "Provide property type"],
        enum: {
            values: ['Studio', 'Apartment', 'Duplex', 'Penthouse'],
            message: "Property type must be one of ['Studio', 'Apartment', 'Duplex', 'Penthouse']"
        }
    },
    furnished: {
        type: String,
        enum: {
            values: ['Yes', 'No'],
            message: "Furnished is either Yes or No"
        },
        required: [true, "Provide if it is furnished or not ?"],
    },
    deliveryTerm: {
        type: String,
        required: [true, "Delivery term is required"],
        enum: {
            values: ['Finished', 'Not Finished', 'Semi Finished', 'Core & Shell'],
            message: "Delivery term must be on of the following ['Finished', 'Not Finished', 'Semi Finished', 'Core & Shell']"
        }
    },
    bedrooms: {
        type: Number,
        required: [true, "Provide number of bedrooms"],
        min: [0, "Bedroom must be >= 1"],
    },
    bathrooms: {
        type: Number,
        required: [true, "Provide number of bathrooms"],
        min: [0, "How on earth, the estate doesn't have a bathroom. Do we keep it!!!"],
    },
    area: {
        type: Number,
        required: [true, "Provide area of the estate."],
        min: [0, "Can we live in null? If area is less than 0, then it is not exist."]
    },
    level: {
        type: Number,
        required: [true, "Provide the estate level."],
        min: [0, "level is less than zero? Is it underground. Impossible"],
    },
    price: {
        type: Number,
        required: [true, "Provide the predicted price"],
        min: [0, "Predicted price cannot be less than 1 or negative."],
    },
    pricePerSqm : {
        type: Number,
        min: [0, "Price per sqm cannot be less than 0"]
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Prediction must be associated to a user"],
        select: false

    }
},{ timestamps: true})

const Prediction = mongoose.model("Prediction", PredictionSchema)

module.exports = Prediction;