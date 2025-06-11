const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("./catchAsync");
const cloudinary = require("./cloudinary");

// const multerStorage = multer.memoryStorage();
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/users/")
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `user-${req.user.name || "anonymous"}-${Date.now()}.${ext}`)
    }
})

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

exports.uploadUserImage = upload.single('image');

exports.processUserImage = catchAsync(async(req, res, next) => {
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'users',
        });
        req.body.image = result.secure_url;
    }
    next();
});