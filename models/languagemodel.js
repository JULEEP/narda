const mongoose = require("mongoose");

const language = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  languageName: {
    type: String,
    trim: true,
  },
  keyword: {
    type: Object,
    default: {
      Search: "",
    },
  },
  isDelete: {
    type: String,
    enum: ["Yes", "No"],
    default: "No",
  },
  logCreatedDate: {
    type: String,
  },
  logModifiedDate: {
    type: String,
  },
});

module.exports = mongoose.model("languages", language);
