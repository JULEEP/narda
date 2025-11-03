const mongoose = require("mongoose");
const state = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  isdeleted: {
    type: String,
    enum: ["No", "Yes"],
    default: "No",
  },
  logCreatedDate: {
    type: String,
  },
  logModifiedDate: {
    type: String,
  },
});

module.exports = mongoose.model("states", state);
