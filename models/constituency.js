const mongoose = require("mongoose");
const constituency = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  stateId: {
    type: String,
  },
  stateName: {
    type: String,
  },
  districtId: {
    type: String,
  },
  districtName: {
    type: String,
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

module.exports = mongoose.model("constituencys", constituency);
