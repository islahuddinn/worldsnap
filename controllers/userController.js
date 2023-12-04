const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handleFactory");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // create error if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This rout is not for password update please use passwordupdate user",
        400
      )
    );
  }
  // WE FILTERED OUT THE UNWANTED FIELDS

  const filteredBody = filterObj(req.body, "name", "email");

  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

exports.updateUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.photo = req.body.photo || user.photo;
    user.country = req.body.country || user.country;
    user.state = req.body.state || user.state;
    user.city = req.body.city || user.city;

    const updateUser = await user.save();

    res.json({
      _id: updateUser._id,
      name: updateUser.name,
      photo: updateUser.photo,
      country: updateUser.country,
      state: updateUser.state,
      city: updateUser.city,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createUser = factory.createOne(User);
exports.getUser = factory.getOne(User);
// Do not use for updating password
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
