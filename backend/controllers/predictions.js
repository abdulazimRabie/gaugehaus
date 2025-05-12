const axois = require("axios");
const catchAsync = require("../utils/catchAsync");

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