const express = require("express");
const globalErrorHandler = require("./controllers/error");
const estateRouter = require("./routes/estate");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/user");
const predictionRouter = require("./routes/prediction");
const likeRouter = require("./routes/like");
const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/estates", estateRouter);
app.use("/api/users", usersRouter);
app.use("/api/predictions", predictionRouter);
app.use("/api/likes", likeRouter);

app.get("/welcome", (req, res) => {
    res.status(200).json({
        "welcome": "welcome man!"
    })
})

// Error handling
app.use(globalErrorHandler);

module.exports = app;