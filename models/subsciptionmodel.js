const mongoose = require("mongoose");
const subscriptions = new mongoose.Schema(
  {
    type: { type: String },
    duration: { type: String },
    planName: { type: String },
    price: { type: String },
    discount: { type: String },
    advantages: { type: Array },
    status: { type: String },
    image: { type: String },
    popupImg: { type: String, }, // सिर्फ़ popup image
  },
  { timestamps: true }
);

module.exports = mongoose.model("subscription", subscriptions);
