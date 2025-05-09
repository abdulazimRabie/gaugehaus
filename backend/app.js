const express = require("express");
const globalErrorHandler = require("./controllers/error");
const estateRouter = require("./routes/estate");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/user");
const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/estate", estateRouter);
app.use("/api/users", usersRouter);

// Error handling
app.use(globalErrorHandler);

module.exports = app;