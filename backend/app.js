const express = require("express");

const estateRouter = require("./routes/estate");

const app = express();

app.use(express.json());

app.use("/api/estate", estateRouter);

module.exports = app;