const reportermodel = require("../models/reportermodel");
const brcyptjs = require("bcrypt");

const addreporter = async function (req, res) {
  try {
    console.log(req.body, "bodyyy");
    const userdata = await reportermodel.findOne({ email: req.body.email });
    if (userdata) {
      return res
        .status(400)
        .send({ status: false, message: "user with email already exists" });
    }

    let password = await brcyptjs.hash(req.body.password, 10);
    req.body.password = password;
    if (req.file) {
      let file = req.file;
      //const path = `uploads/profileImg/${file.originalname}`
      req.body.profileimg = file.path;
    }

    let user = await reportermodel.create(req.body);
    console.log(user, "userrr");
    if (user) {
      return res
        .status(200)
        .send({ status: true, message: "Reporter added Sucessfully" });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Unable to Add Reporter" });
    }
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
};

const editReporter = async (req, res) => {
  try {
    console.log(req.body);
    // // let password = await brcyptjs.hash(req.body.password, 10);
    // req.body.password = password;
    // Include the file path if a file is provided in the request
    if (req.file) {
      req.body.profileimg = req.file.path;
    }
    let updateuser = await reportermodel.findByIdAndUpdate(
      { _id: req.params.id },
      { ...req.body },

      { new: true }
    );
    if (updateuser == null) {
      return res.status(400).send({ status: "false", message: "Bad request" });
    }

    return res
      .status(200)
      .send({ status: true, message: "Updated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "Something went wrong" });
  }
};

const getreporter = async function (req, res) {
  try {
    // const userid = req.body.userid;
    // let reporter = await reportermodel.findOne({ _id: userid });

    const reporter = await reportermodel.findOne({ _id: req.body.id });
    if (reporter) {
      res.status(200).json({
        success: true,
        message: "Reporter details have been retrived successfully",
        reporter,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Bad request",
        reporter,
      });
    }
  } catch (error) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

const removeUser = async (req, res) => {
  try {
    let id = req.params.id;
    const deleteuser = await reportermodel.deleteOne({ _id: id });
    if (!deleteuser) {
      return res.status(400).send({ status: false, message: "Bad request" });
    }
    return res
      .status(200)
      .send({ status: true, message: "Deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "Something went wrong" });
  }
};

const searchreporter = async function (req, res) {
  try {
    let userkey = req.body.username;
    console.log(userkey);
    let users = await reportermodel
      .find({ name: { $regex: userkey } })
      .select({ __v: 0 });
    console.log(users);
    if (users) {
      return res.status(200).json({ status: true, data: users });
    }
  } catch (err) {
    return res.status(404).send({ message: err.message });
  }
};

//getall reporters
const getallreporters = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition = {
        $or: [{ name: regex }],
      };
    }
    // condition.type = req.body.type;
    console.log(condition);
    const reporters = await reportermodel
      .find(condition)
      .sort({ logCreatedDate: -1 });
    if (reporters) {
      res.status(200).json({
        success: true,
        message: "Reporter's have been retrived successfully ",
        reporters: reporters,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//active and inactive
const getallactiveandinactivereporters = async function (req, res) {
  try {
    const { searchQuery } = req.query;

    // Create a search condition if searchQuery is provided
    const searchCondition = searchQuery
      ? { name: { $regex: searchQuery, $options: "i" } }
      : {};

    const activeReporters = await reportermodel
      .find({
        ...searchCondition,
        status: "active",
      })
      .sort({ createdAt: -1 });
    const inactiveReporters = await reportermodel
      .find({
        ...searchCondition,
        status: "inactive",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Active and inactive reporters have been retrieved successfully",
      activeReporters,
      inactiveReporters,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// update status reporter
exports.updatereporterstatus = async function (req, res) {
  try {
    const reporter = await reportermodel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          status: req.body.status,
        },
      },
      {
        new: true,
      }
    );
    if (reporter) {
      res.status(200).json({
        success: true,
        message: "Updated successfully",
      });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

module.exports.addreporter = addreporter;
module.exports.editReporter = editReporter;
module.exports.getreporter = getreporter;
module.exports.removeUser = removeUser;
module.exports.searchreporter = searchreporter;
module.exports.getallreporters = getallreporters;
module.exports.getallactiveandinactivereporters =
  getallactiveandinactivereporters;
