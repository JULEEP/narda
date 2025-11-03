// importing models
const staffModel = require("../models/staff");
const roleModel = require("../models/roleAndPermission");
const departmentModel = require("../models/department");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { DateTime } = require("luxon");

//ADD
const addstaff = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    // if (req.body.password !== req.body.confirmPassword) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Password and confirm password does not match!",
    //   });
    // }
    const staff = await staffModel.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    });
    if (staff) {
      return res
        .status(400)
        .json({ success: false, message: "Staff already exist!" });
    }
    const bcryptedpassword = bcrypt.hashSync(req.body.password, 10);

    const department = await departmentModel.findOne(
      { _id: req.body.departmentId },
      { departmentName: 1 }
    );
    const role = await roleModel.findOne(
      { _id: req.body.roleId },
      { roleName: 1 }
    );

    const staffObj = new staffModel({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      password: bcryptedpassword,
      profilepic: req.file ? req.file.path : "",
      departmentId: req.body.departmentId,
      departmentName: department ? department.departmentName : "",
      roleId: req.body.roleId,
      roleName: role ? role.roleName : "",
      address: req.body.address,
      //   employeId: req.body.employeId,
      //   employeName: req.body.employeName,
      logCreatedDate: logDate,
      logModifiedDate: logDate,
    });
    const savestaff = await staffObj.save();

    if (savestaff) {
      res.status(200).json({ success: true, message: "Staff has been added" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// edit
const editdstaff = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const department = await departmentModel.findOne(
      { _id: req.body.departmentId },
      { departmentName: 1 }
    );
    const role = await roleModel.findOne(
      { _id: req.body.roleId },
      { roleName: 1 }
    );

    const staff = await staffModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          phone: req.body.phone,
          email: req.body.email,
          profilepic: req.file ? req.file.path : console.log("No Img"),
          // password: bcryptedpassword,
          departmentId: req.body.departmentId,
          departmentName: department ? department.departmentName : "",
          roleId: req.body.roleId,
          roleName: role ? role.roleName : "",
          address: req.body.address,
          logModifiedDate: logDate,
        },
      },
      {
        new: true,
      }
    );
    if (staff) {
      res
        .status(200)
        .json({ success: true, message: "Staff has been updated" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// getall staff
const getAllstaff = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition = {
        $or: [{ name: regex }, { email: regex }],
      };
    }
    // condition.departmentName = { $ne: "superadmin" };
    console.log(condition);
    const staff = await staffModel.find(condition).sort({ logCreatedDate: -1 });
    return res.status(200).json({
      success: true,
      message: "Staff details has been retrieved",
      staff: staff,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};

// delete staff
const deletestaff = async function (req, res) {
  try {
    const staff = await staffModel.findOneAndDelete({ _id: req.params.id });
    if (staff) {
      return res
        .status(200)
        .json({ success: true, message: "Staff has been deleted" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Staff could not be deleted" });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong", Error: error });
  }
};

module.exports.addstaff = addstaff;
module.exports.getAllstaff = getAllstaff;
module.exports.editdstaff = editdstaff;
module.exports.deletestaff = deletestaff;
