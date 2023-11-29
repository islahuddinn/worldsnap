const mongoose = require("mongoose");
const otpGenerator = require("otp-generator");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a name"],
  },
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
    lowercase: true,
    validate: [
      {
        validator: validator.isEmail,
        message: "Please enter a valid email",
      },
      {
        validator: isEmailExists,
        message: "User with email address already exists",
      },
    ],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  photo: {
    type: String,
    sparse: true,
  },
  country: {
    type: String,
    sparse: true,
  },
  state: {
    type: String,
    sparse: true,
  },
  city: {
    type: String,
    sparse: true,
  },
  minutes: {
    type: Number,
    default: 0,
  },
  seconds: {
    type: Number,
    default: 0,
  },
  milliseconds: {
    type: Number,
    default: 0,
  },
  gameStatus: {
    type: String,
    default: "not_started",
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// exports.isEmailExists = async (email, userId) => {
//   try {
//     const count = await mongoose.models["User"].countDocuments({
//       _id: { $ne: userId },
//       email: email,
//     });
//     return count > 0;
//   } catch (err) {
//     throw err;
//   }
// };
async function isEmailExists(email) {
  try {
    if (email) {
      const count = await mongoose.models["User"].countDocuments({
        email: email,
      });
      return count === 0;
    } else {
      return false;
    }
  } catch (err) {
    // Handle the error, log or throw as needed
    console.error(err);
    return false;
  }
}
userSchema.pre("save", async function (next) {
  // only runs this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with a cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 2000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // It will point to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means the password has not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // const resetToken = crypto.randomBytes(32).toString("hex");
  const resetToken = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // console.log({ resetToken }, this.passwordResetToken);
  // console.log(resetToken);
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
