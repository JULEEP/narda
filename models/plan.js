const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  name: {
    type: String,
  },
  validity: {
    type: Number,
  },
  price: {
    type: Number,
  },
  offerPrice: {
    type: Number,
  },
  image: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  benefits: {
    type: Array,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  logCreatedDate: {
    type: String,
  },
  logModifiedDate: {
    type: String,
  },
});
module.exports = mongoose.model("plans", schema);
