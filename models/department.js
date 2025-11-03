const mongoose = require("mongoose");
const department = new mongoose.Schema({
  departmentName: {
    type: String,
    trim: true,
    index: true,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
  },
  logCreatedDate: {
    type: String,
  },
  logModifiedDate: {
    type: String,
  },
});
module.exports = mongoose.model("departments", department);
