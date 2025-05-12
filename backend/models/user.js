const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Field name is required."],
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: [true, "This email is already logged in."],
        validate: [validator.isEmail, "Invalid email. Email must be a@b.c"]
    },
    username: {
        type: String
    },
    password: {
        type: String,
        required: [true, "Email is required."],
        validate: {
            validator: function() {
                return this.password.length >= 8;
            },
            message: "Minimum length of passwrod is eight (8) characters."
        },
        select: false
    },
    confirmedPassword: {
        type: String,
        required: [true, "Confirmed password is required."],
        validate: {
            validator: function() {
                return this.password === this.confirmedPassword;
            },
            message: "Password and confirmed must be identical."
        },
    },
    location: {
        type: String,
    },
    phoneNumber: {
        type: Number,
        minlength: [11, "Phone number mmust have at least 11 digits."]
    },
    image: {
        type: String,
        default: "avatar_default.jpg"
    },
    about: {
        type: String
    },
    likedEstates: [String],
    estates: [String],
    predictions: [{
        type: Schema.Types.ObjectId,
        ref: 'Prediction'
    }],
    joinedAt: Date,
    changedPasswordAt: Date,
    resetOTP: String,
    resetOTPExpiresAt: Date
})

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    if(this.isNew) this.joinedAt = new Date();

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmedPassword = undefined;
    next();
})

UserSchema.methods.createHashedOTP = function (resetOTP) {
    this.resetOTP = crypto.createHash("sha256").update(resetOTP).digest("hex");
    this.resetOTPExpiresAt = Date.now() + (10 * 60 * 1000);
}

const User = mongoose.model("User", UserSchema);

module.exports = User;