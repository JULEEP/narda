const mongoose = require("mongoose");
const department = require("./department");

const role = new mongoose.Schema(
  {
    roleName: {
      type: String,
      trim: true,
      index: true,
      unique: true,
      required: true,
    },
    rolesAndPermission: {
      type: Array,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
    },
    logCreatedDate: {
      type: String,
    },
    // departmentId
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
    },
    departmentName: {
      type: String,
    },
    logModifiedDate: {
      type: String,
    },
  }
  // { timestamps: true }
);

module.exports = mongoose.model("Roles", role);
