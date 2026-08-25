"use strict";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const routes = require("./routes");
const { errorHandler } = require("./middleware");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PS117 backend is running",
  });
});

app.use("/api", routes);

app.use(errorHandler);

module.exports = app;