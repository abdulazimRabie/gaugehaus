const mongoose = require("mongoose");

const EstateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Estate's title is required!"]
    },
    propertyType: {
        type: String,
        required: [true, "Provide property type"],
        enum: {
            values: ['Studio', 'Apartment', 'Duplex', 'Penthouse'],
            message: "Property type must be one of ['Studio', 'Apartment', 'Duplex', 'Penthouse']"
        }
    },
    location: {
        // GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        city: String,
    },
    price: {
        type: Number,
        required: [true, "How much is the estate."],
        min: [1, "Estate's price cannot less than one"]
    },
    description: {
        type: String,
        required: [true, "Describe the esatate please."],
        minlength: [10, "Description cannot be less than 10 characters."]
    },
    bedrooms: {
        type: Number,
        required: [true, "How many bedrooms does the estate have?"],
        min: [1, "Bedrooms cannot be less than one."]
    },
    bathrooms: {
        type: Number,
        required: [true, "How many bathrooms does the estate have?"],
        min: [1, "bathrooms cannot be less than one."]
    },
    livingrooms: {
        type: Number,
        required: [true, "How many livingrooms does the estate have?"],
        min: [1, "livingrooms cannot be less than one."]
    },
    kitchen: {
        type: Number,
        required: [true, "How many kitchens does the estate have?"],
        min: [1, "kitchens cannot be less than one."]
    },
    area: {
        type: Number,
        required: [true, "Provide area of the estate."],
        min: [0, "Can we live in null? If area is less than 0, then it is not exist."]
    },
    compoundName: {
        type: String,
    },
    furnished: {
        type: Boolean,
        required: [true, "Is the estate furnished?"]
    },
    deliveryDate: {
        type: Date
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Who does owen the estate ?"],
    },
    likes: {
        type: Number,
        default: 0
    },
    images: {
        type: [String]
    }
})

module.exports = mongoose.model("Estate", EstateSchema)