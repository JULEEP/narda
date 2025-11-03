const mongoose = require("mongoose");
const otp = new mongoose.Schema(
  {
    Otp: {
      type: String,
    },
    emailId: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    expireAt: {
      type: Date,
      default: Date.now,
      index: {
        expireAfterSeconds: 600,
      },
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("otps", otp);
