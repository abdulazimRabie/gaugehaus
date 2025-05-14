const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config({path: "./config.env"});

mongoose.connect(process.env.DB_LOCAL_URL)
.then( connectionObj => {
    // console.log(connectionObj);
    console.log("Database connected successfully")
})
.catch( error => console.log("Failed to connect database"));

app.listen(3001, () => {
    console.log("Server is running on port 3001");
})