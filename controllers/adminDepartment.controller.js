// importing models
const departmentModel = require("../models/department");
const { DateTime } = require("luxon");

// add departments
const adddepartment = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    if (new RegExp(req.body.departmentName, "i").test("superadmin")) {
      return res.status(400).json({
        succcess: false,
        message: "Super admin should not be used as department name",
      });
    }
    if (new RegExp(req.body.departmentName, "i").test("super admin")) {
      return res.status(400).json({
        succcess: false,
        message: "Super admin should not be used as department name",
      });
    }

    const department = await departmentModel.findOne({
      departmentName: req.body.departmentName,
    });
    if (department !== null) {
      return res.status(400).json({
        succcess: false,
        message: "Department already exist!",
      });
    }

    const departmentObj = new departmentModel({
      departmentName: req.body.departmentName,
      createdBy: req.userId,
      logCreatedDate: logDate,
      logModifiedDate: logDate,
      rolesandPermision: {
        Dashview: false,
      },
    });

    const savedepartment = departmentObj.save();
    if (savedepartment) {
      res.status(200).json({
        succcess: true,
        message: "Department has been added successfully",
      });
    } else {
      res
        .status(400)
        .json({ succcess: false, message: "Department could not be added" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ succcess: false, message: "Something went wrong" });
  }
};

// get departments
const getdepartments = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition.departmentName = regex;
    }
    console.log(condition);

    const departments = await departmentModel
      .find(condition)
      .sort({ logCreatedDate: -1 });

    res.status(200).json({
      succcess: true,
      message: "Departments has retrived successfully",
      departments: departments,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ succcess: false, message: "Something went wrong" });
  }
};

// edit department
const editdepartment = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const departments = await departmentModel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          departmentName: req.body.departmentName,
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );
    if (departments) {
      res.status(200).json({ success: true, message: "Updated successfully" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ succcess: false, message: "Something went wrong" });
  }
};

// delete department
const deletedepartment = async function (req, res) {
  try {
    const departments = await departmentModel.findByIdAndDelete({
      _id: req.params.id,
    });

    if (departments) {
      res.status(200).json({
        succcess: true,
        message: "Deleted successfully",
      });
    } else {
      res.status(400).json({ succcess: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ succcess: false, message: "Something went wrong" });
  }
};

//exports
module.exports.adddepartment = adddepartment;

module.exports.getdepartments = getdepartments;

module.exports.editdepartment = editdepartment;

module.exports.deletedepartment = deletedepartment;
