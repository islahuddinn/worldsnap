const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
// const { SendNotification } = require("../utils/notification");
const momenttz = require("moment-timezone");

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

// Function to simulate an egg timer with immediate stop functionality

const eggTimer = (minutes, seconds) => {
  let remainingTime = minutes * 60 * 1000 + seconds * 1000;
  let intervalId;
  let timerActive = true;

  const stopTimer = () => {
    clearInterval(intervalId);
    timerActive = false;
    console.log("Egg timer stopped!");
  };

  const startTimer = () => {
    const startTime = momenttz(); // Record the start time

    intervalId = setInterval(() => {
      const elapsedMilliseconds = momenttz().diff(startTime);
      remainingTime =
        minutes * 60 * 1000 + seconds * 1000 - elapsedMilliseconds;

      if (remainingTime > 0 && timerActive) {
        // Display remaining time in UTC format
        console.log(
          `Egg timer: ${momenttz()
            .startOf("day")
            .milliseconds(remainingTime)
            .format("HH:mm:ss")} remaining (UTC)`
        );
      } else {
        clearInterval(intervalId);
        timerActive = false; // Set timerActive to false when complete
        console.log("Egg timer complete!");
      }
    }, 1000);
  };

  return { startTimer, stopTimer, timerActive, intervalId };
};

exports.classicPlay = catchAsync(async (req, res, next) => {
  const { minutes, seconds, type } = req.body;

  req.body.mode = "classic";

  if (type === "start" && !req.eggTimerControl) {
    try {
      console.log(
        `Classic play: Egg timer set for ${minutes} minutes and ${seconds} seconds`
      );

      req.eggTimerControl = eggTimer(minutes, seconds);

      req.eggTimerControl.startTimer();

      res.status(200).json({
        status: 200,
        success: true,
        message: "Egg timer started!",
        remainingTime: momenttz()
          .startOf("day")
          .milliseconds(minutes * 60 * 1000 + seconds * 1000)
          .format("HH:mm:ss"),
      });
    } catch (error) {
      console.error("An error occurred:", error);
      return next(
        new AppError(
          "Error while starting the egg timer for classic play mode",
          500
        )
      );
    }
  } else if (
    type === "stop" &&
    req.eggTimerControl &&
    req.eggTimerControl.timerActive
  ) {
    req.eggTimerControl.stopTimer();
    res.status(200).json({
      status: 200,
      success: true,
      message: "Egg timer stopped!",
      remainingTime: momenttz()
        .startOf("day")
        .milliseconds(minutes * 60 * 1000 + seconds * 1000)
        .format("HH:mm:ss"),
    });
  } else {
    return next(new AppError("Invalid request or repeated hit!", 400));
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
