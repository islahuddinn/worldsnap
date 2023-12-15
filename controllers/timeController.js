const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const { SendNotification } = require("../utils/notification");

//Function to set and retrieve agreed-upon time for a user
exports.setAndRetrieveAgreedUponTime = catchAsync(async (req, res, next) => {
  const { mode, minutes, seconds } = req.body;

  // 1) Check if mode, minutes, and seconds are provided
  if (
    !mode ||
    !minutes ||
    !seconds ||
    typeof mode !== "string" ||
    typeof minutes !== "number" ||
    typeof seconds !== "number"
  ) {
    return next(
      new AppError(
        "Please provide valid values for mode, minutes, and seconds!",
        400
      )
    );
  }

  // 2) Get the current user
  const user = await User.findById(req.user.id);

  // 3) Set agreed-upon time for the user based on the game mode
  if (!user.gameModes) {
    user.gameModes = {};
  }

  user.gameModes[mode] = {
    minutes,
    seconds,
  };

  // Save the user with the updated agreed-upon time
  await user.save();

  // 4) Retrieve the agreed-upon time for the user
  const retrievedTime = user.gameModes[mode];

  res.status(200).json({
    status: 200,
    success: true,
    data: { agreedUponTime: retrievedTime },
  });
});

// Egg timer logic for classic play mode
const eggTimer = (minutes, seconds) => {
  return new Promise((resolve) => {
    const totalseconds = minutes * 60 * 1000 + seconds;
    setTimeout(() => {
      resolve();
    }, totalseconds);
  });
};

// Classic play route
exports.classicPlay = catchAsync(async (req, res, next) => {
  const { minutes, seconds } = req.body;

  // Call the function to set and retrieve time for classic play mode
  req.body.mode = "classic";

  try {
    console.log(
      `Classic play: Egg timer set for ${minutes} minutes and ${seconds}seconds`
    );
    await eggTimer(minutes, seconds);
    console.log("Egg timer complete!");
    // Continue with the rest of your code or send a response
    res
      .status(200)
      .json({ status: 200, success: true, message: "Egg timer complete!" });
  } catch (error) {
    console.error("An error occurred:", error);
    return next(
      new AppError(
        "Error while running the egg timer for classic play mode",
        500
      )
    );
  }
});

// Logic for countdown clock in speed play mode

// Countdown clock logic
const countdownClock = (minutes, seconds) => {
  return new Promise((resolve) => {
    // countdown clock logic here
    // use setInterval to update the countdown
    let remainingTime = minutes * 60 * 1000 + seconds;

    const intervalId = setInterval(() => {
      console.log(`Countdown: ${remainingTime / 1000} seconds remaining`);

      // Update the remaining time
      remainingTime -= 1000;

      // Check if the countdown is complete
      if (remainingTime <= 0) {
        clearInterval(intervalId);
        console.log("Countdown complete!");
        resolve();
      }
    }, 1000);
  });
};

//Countdown clock route
exports.speedPlay = catchAsync(async (req, res, next) => {
  const { mode, minutes, seconds } = req.body;

  // Validate input
  if (mode !== "countdown") {
    return next(new AppError("Please select a valid mode!", 400));
  }

  // Call the function to set and retrieve time for countdown clock
  req.body.mode = "countdown";

  try {
    console.log(
      `Countdown started for ${minutes} minutes and ${seconds} seconds`
    );
    await countdownClock(minutes, seconds);
    console.log("Countdown clock complete!");
    res.status(200).json({
      status: 200,
      success: true,
      message: "Countdown clock complete!",
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return next(new AppError("Error while running the countdown clock", 500));
  }
});

// Stopwatch logic
const stopwatch = () => {
  return new Promise((resolve) => {
    // Stopwatch logic here
    // Use setInterval to update the stopwatch
    let elapsedTime = 0;

    const intervalId = setInterval(() => {
      console.log(`Stopwatch: ${elapsedTime / 1000} seconds elapsed`);

      // Update the elapsed time
      elapsedTime += 1000;
    }, 1000);

    // Resolve the promise when needed (e.g., when user stops the stopwatch)
    // In this example, resolve after 10 seconds
    setTimeout(() => {
      clearInterval(intervalId);
      console.log("Stopwatch complete!");
      resolve();
    }, 10000);
  });
};

// Solo play route with stopwatch
exports.soloPlay = catchAsync(async (req, res, next) => {
  const { mode } = req.body;

  // Validate input
  if (mode !== "stopwatch") {
    return next(new AppError("Please select a valid mode!", 400));
  }

  try {
    console.log("Stopwatch started");
    await stopwatch();
    console.log("Stopwatch complete!");
    res.status(200).json({
      status: 200,
      success: true,
      message: "Stopwatch complete!",
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return next(new AppError("Error while running the stopwatch", 500));
  }
});
