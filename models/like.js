const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema({
    estate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estate',
        required: [true, "Provide the liked estate, please."]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: ['Whos is user likes the estate ?']
    },
    likedAt: Date
})

module.exports = mongoose.model("Like", LikeSchema);