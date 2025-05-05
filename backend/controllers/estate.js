const axios = require("axios");

exports.predictPrice = async (req, res, next) => {
    try {
        const url = "http://localhost:4001/predict";
        const {hp, wt} = req.body;
        console.log(req.body);
        const prediction = await axios.post(url, {hp, wt});
        console.log(prediction.data)
        res.status(200).json({
            status: "success",
            data: {
                mpg: prediction.data.mpg
            }
        })
    } catch(error) {
        console.log(error);
        res.status(400).json({
            status: "error",
            message: error.message
        })
    }
}