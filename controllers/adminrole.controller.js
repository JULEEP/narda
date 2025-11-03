// importing models
const roleModel = require("../models/roleAndPermission");
const departmentModel = require("../models/department");
const { DateTime } = require("luxon");

// controller
const addrole = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    // const regexp = new RegExp(req.body.role, "i");
    // const roleExists = await roleModel.findOne({
    //   role: regexp,
    // });
    // if (roleExists || req.body.role == "admin") {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "The role already exists" });
    // }

    // const admin = await adminModel.findOne({ _id: req.userId }, { name: 1 });

    const department = await departmentModel.findOne(
      { _id: req.body.departmentId },
      { departmentName: 1 }
    );

    const roleObj = new roleModel({
      roleName: req.body.roleName,
      rolesAndPermission: req.body.rolesAndPermission,
      departmentId: req.body.departmentId,
      departmentName: department ? department.departmentName : "",
      logCreatedDate: logDate,
      logModifiedDate: logDate,
    });

    const saverole = await roleObj.save();
    if (saverole) {
      res.status(200).json({ success: true, message: "Role has been added" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Role could not be add" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// getAll roles
const getAllroles = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition = {
        $or: [{ roleName: regex }],
      };
    }
    console.log(condition);
    const roles = await roleModel.find(condition).sort({ logCreatedDate: -1 });
    if (roles) {
      res.status(200).json({
        success: true,
        message: "Roles's has been retrived successfully ",
        roles: roles,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// edit role
const editrole = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    const department = await departmentModel.findOne(
      { _id: req.body.departmentId },
      { departmentName: 1 }
    );

    const role = await roleModel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          roleName: req.body.roleName,
          rolesAndPermission: req.body.rolesAndPermission,
          departmentId: req.body.departmentId,
          departmentName: department ? department.departmentName : "",
          logModifiedDate: logDate,
        },
      },
      {
        new: true,
      }
    );
    if (role) {
      res.status(200).json({ success: true, message: "Role has been updated" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Role could not be update" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// delete role
const deleterole = async function (req, res) {
  try {
    const role = await roleModel.findOneAndDelete({
      _id: req.params.id,
    });
    if (role) {
      res.status(200).json({ success: true, message: "Role has been deleted" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Role could not be delete" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// get by id
const getRole = async function (req, res) {
  try {
    const data = await roleModel.findOne({ _id: req.body._id });

    if (data) {
      res.status(200).json({
        success: true,
        message: "Role details has been retrived",
        data: data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Role details could not be retrived",
        data: data,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//exports
module.exports.addrole = addrole;

module.exports.getAllroles = getAllroles;

module.exports.editrole = editrole;

module.exports.deleterole = deleterole;

module.exports.getRole = getRole;
