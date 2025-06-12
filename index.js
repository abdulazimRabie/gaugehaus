require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const app = require("./app");
const port = 3000 || 4000 || process.env.PORT;

mongoose
  .connect(process.env.DB_URL)
  .then((connectionObj) => {
    // console.log(connectionObj);
    console.log("Database connected successfully");
  })
  .catch((error) => console.log("Failed to connect database"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
