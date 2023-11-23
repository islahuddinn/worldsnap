const express = require("express");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const fs = require("fs");
const morgan = require("morgan");
const helmet = require("helmet");
const xss = require("xss-clean");
const path = require("path");
// const hpp = require('hpp');

const app = express();
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

//1) GLOBAL MIDDLEWARES
// serving static files
const publicPath = app.use(express.static(path.join(__dirname, "./public")));
app.get("/privacy-policy", (req, res) => {
  // Send the privacy policy file
  res.sendFile(path.join(publicPath, "privacy-policy.txt"));
});

app.get("/about-us", (req, res) => {
  // Send the about us file
  res.sendFile(path.join(publicPath, "terms-of-service.txt"));
});

//set security http headers
app.use(helmet());
// Development logging
app.use(express.json()); //Body parser for JSON data
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(xss());

app.use((req, res, next) => {
  console.log("Hey, from middleware");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString;
  console.log(req.headers);
  next();
});

// ROUTES
app.get("/", (req, res) => {
  res.status(200).render("base");
});
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
