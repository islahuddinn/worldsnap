const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "must enter email"],
      //   lowercase: truee,
      validate: [validator.isEmail, "please provide a valid email"],
    },
    number: String,
    image: {
      type: String,
      default:
        "https://icon-library.com/images/default-profile-icon/default-profile-icon-6.jpg",
    },
    password: {
      type: String,
      required: [true, "must enter password"],
      minlength: 8,
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
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

    // role: {
    //   type: String,
    //   enum: {
    //     values: ["admin", "user", "guardian"],
    //     message: "Enter valid role ",
    //   },
    //   default: "user",
    // },
    // location: {
    //   type: {
    //     type: String,
    //     default: "Point",
    //   },
    //   coordinates: { type: [Number], default: [0.0, 0.0] },
    //   address: String,
    //   description: String,
    // },
    // LiveLocation: {
    //   type: {
    //     type: String,
    //     default: "Point",
    //   },
    //   coordinates: { type: [Number], default: [0.0, 0.0] },
    //   address: String,
    //   description: String,
    // },
    otp: {
      type: Number,
    },
    otpExpires: Date,
    deviceToken: String,
    verified: {
      type: Boolean,
      default: false,
    },
    customerId: String,
    // subscriptionId: String,
    // creator: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: "User",
    // },
    // subscriptionPlan: {
    //   type: String,
    //   enum: {
    //     values: ["free", "yearly"],
    //     message: "Enter valid plan ",
    //   },
    //   default: "free",
    // },
    // isNotification: {
    //   type: Boolean,
    //   default: true,
    // },
    // locationUpdatedAt: Date,
    // joinLink: Number,
    // isGuardianActive: {
    //   type: Boolean,
    //   default: false,
    // },
    // isLocationLive: {
    //   type: Boolean,
    //   default: false,
    // },
    // isDanger: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
userSchema.index({ location: "2dsphere" });

userSchema.pre("save", async function (next) {
  //only run this function if password id actually modified
  if (!this.isModified("password")) return next();
  // Hash the password with cost
  this.password = await bcrypt.hash(this.password, 12);
  // remove(stop) the confirmPassword to store in db. require means necessary to input not to save in db.
  this.confirmPassword = undefined;
  next();
});
// password Tester
userSchema.methods.correctPassword = async function (
  passwordByUser,
  passwordInDb
) {
  return await bcrypt.compare(passwordByUser, passwordInDb);
};

// ========method to protect routes verifies all about token

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// update "passwordChangedAt value in DB whenever we update password "
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; //here -1000 mili seconds is to make sure that it will not creat any problem in login as some times that gets this
  next();
});

// Middleware to only get active=true users
userSchema.pre(/^find/, function (next) {
  // here "this" points to the current property`
  this.find({ active: true });
  next();
});
const User = mongoose.model("User", userSchema);
module.exports = User;
