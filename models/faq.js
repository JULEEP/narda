const mongoose = require("mongoose");
const faq = new mongoose.Schema({
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
  type: {
    type: String,
    default: "",
  },
  logCreatedDate: {
    type: String,
  },
  logModifiedDate: {
    type: String,
  },
});
module.exports = mongoose.model("faqs", faq);
