const mongoose = require("mongoose");

const PredictionSchema = mongoose.Schema({

})

const Prediction = mongoose.model("Prediction", PredictionSchema)

module.exports = Prediction;