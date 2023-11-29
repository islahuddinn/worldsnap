const crypto = require("crypto");
const otpGenerator = require("otp-generator");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/mailSender");
const AppError = require("../utils/appError");
const { decoded } = require("punycode");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // the code bellow is responsible for cookei functionality

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
  // Remove the password from the output

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) check if email and passsword exists
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  //2)check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Please provide email and password", 401));
  }

  //3) if everything is ok send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization;

  // console.log(token);

  if (!token) {
    return next(
      new AppError("You are not logged in please log in to get access.", 401)
    );
  }

  // 2) verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // console.log(decoded);

  // 3) check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The User belongging to this token does no longer exist.",
        401
      )
    );
  }
  // 4) check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "User recently changed the password! please logion again",
        401
      )
    );
  }

  // Grant access to the protected route
  req.user = currentUser;
  next();
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on psted email address
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address", 404));
  }
  // 2) Generate the rendom reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) send it to the user email address
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forget your password? submit a patch
    request with your new password and passwordConfirm to: ${resetUrl}.\n If you dont forget
    your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: "your password reset token is valid for 10 minutes",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token send to user email address!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending email. Try again later!"),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the user.
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If token has not expired and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Update changePasswordAt property for the user
  // 4) Log the user in, send the jwt
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get the user from the collection
  const user = await User.findById(req.user.id).select("+password");
  // check if the curent password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is incorrect.", 401));
  }
  // if so update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // remeber in this case user.findbyidandupdate method will not work

  // log user in and send jwt
  createSendToken(user, 200, res);
});
