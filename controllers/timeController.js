const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");

// Function to set and retrieve agreed-upon time for a user
exports.setAndRetrieveAgreedUponTime = catchAsync(async (req, res, next) => {
  const { minutes, seconds, milliseconds } = req.body;

  // 1) Check if minutes, seconds, and milliseconds are provided
  if (
    !minutes ||
    !seconds ||
    !milliseconds ||
    typeof minutes !== "Number" ||
    typeof seconds !== "Number" ||
    typeof milliseconds !== "Number"
  ) {
    return next(
      new AppError(
        "Please provide valid values for minutes, seconds, and milliseconds!",
        400
      )
    );
  }

  // 2) Get the current user
  const user = await User.findById(req.user.id);

  // 3) Set agreed-upon time for the user
  user.agreedUponTime = {
    minutes,
    seconds,
    milliseconds,
  };

  // Save the user with the updated agreed-upon time
  await user.save();

  // 4) Retrieve the agreed-upon time for the user
  const retrievedTime = user.agreedUponTime;

  // Continue with the rest of your code or send the retrieved time as a response
  res
    .status(200)
    .json({ status: "success", data: { agreedUponTime: retrievedTime } });
});

// Example route for setting and retrieving agreed-upon time
// app.post(
//   "/set-and-retrieve-agreed-upon-time",
//   authMiddleware,
//   setAndRetrieveAgreedUponTime
// );