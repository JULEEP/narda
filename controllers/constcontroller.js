const constituteModel = require("../models/constituency");
const districtModel = require("../models/district");
const stateModel = require("../models/state");

// add a Constituency
const addConstituency = async function (req, res) {
  try {
    const logDate = new Date().toISOString();
    const dist = await constituteModel.findOne({
      title: { $regex: new RegExp(req.body.title, "i") },
      isdeleted: "No",
    });

    if (dist !== null) {
      res.status(400).json({ message: "Constituency already exist!" });
    } else {
      const stater = await stateModel.findOne(
        { _id: req.body.stateId },
        { title: 1 }
      );
      const distr = await districtModel.findOne(
        { _id: req.body.districtId },
        { title: 1 }
      );

      const cityObj = new constituteModel({
        title: req.body.title,
        stateId: req.body.stateId,
        stateName: stater ? stater.title : "",
        districtId: req.body.districtId,
        districtName: distr ? distr.title : "",
        logCreatedDate: logDate,
        logModifiedDate: logDate,
      });

      const saveCity = await cityObj.save();
      if (saveCity) {
        res.status(200).json({ message: "Constituency added successfully" });
      } else {
        res.status(400).json({ message: "Constituency could not be added!" });
      }
    }
  } catch (err) {
    res.status(400).json({ message: "Something went wrong!" });
  }
};

// get all Constituencies
const getAllConstituencies = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.body.searchQuery, "i");
    if (req.body.searchQuery) {
      condition.title = regex;
    }
    condition.isdeleted = "No";
    console.log(condition);

    const data = await constituteModel
      .find(condition)
      .sort({ logCreatedDate: -1 });

    res.status(200).json({
      success: true,
      message: "Constituencies have been retrieved successfully",
      constResult: data,
    });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: err.message ?? "Bad request" });
  }
};

// get all Non deleted Constituency
const getAllNonDeletedConstituency = async function (req, res) {
  try {
    const { searchQuery } = req.query;

    // Create a search condition if searchQuery is provided
    const searchCondition = searchQuery
      ? { title: { $regex: searchQuery, $options: "i" } }
      : {};

    const data = await constituteModel
      .find({ isdeleted: "No", ...searchCondition })
      .sort({ logCreatedDate: -1 });

    res.status(200).json({
      success: true,
      message: "Constituencies have been retrieved successfully",
      constResult: data,
    });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: err.message ?? "Bad request" });
  }
};

// get all Constituencies by district id
const getAllConstituenciesByDist = async function (req, res) {
  try {
    const data = await constituteModel
      .find({
        $and: [{ districtId: req.body.districtId }, { isdeleted: "No" }],
      })
      .sort({ logCreatedDate: -1 });

    res.status(200).json({
      success: true,
      message: "Constituency have been retrieved successfully",
      constResult: data,
    });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: err.message ?? "Bad request" });
  }
};

// get all App Constituencies by district id
const getAllAppConstituenciesByDist = async function (req, res) {
  try {
    const data = await constituteModel
      .find({
        $and: [{ districtId: req.body.districtId }, { isdeleted: "No" }],
      })
      .sort({ logCreatedDate: -1 });

    const constdata = [];
    data.map((val) => {
      let obj = {
        _id: val._id,
        title: val.title,
        Hintitle: val.Hintitle,
        Teltitle: val.Teltitle,
        isdeleted: val.isdeleted,
        logCreatedDate: val.logCreatedDate,
        logModifiedDate: val.logModifiedDate,
      };
      constdata.push(obj);
    });

    res.status(200).json({
      success: true,
      message: "Constituency have been retrieved successfully",
      constResult: constdata,
    });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: err.message ?? "Bad request" });
  }
};

// get Constituency details
const getConstituency = async function (req, res) {
  try {
    const data = await constituteModel.findOne({ _id: req.body._id });

    res.status(200).json({
      success: true,
      message: "Constituency has been retrieved successfully",
      constResult: data ?? {},
    });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: err.message ?? "Bad request" });
  }
};

// edit Constituency
const editConstituency = async function (req, res) {
  try {
    const logDate = new Date().toISOString();
    const stater = await stateModel.findOne(
      { _id: req.body.stateId },
      { title: 1 }
    );
    const distr = await districtModel.findOne(
      { _id: req.body.districtId },
      { title: 1 }
    );
    const City = await constituteModel.updateOne(
      { _id: req.body.id },
      {
        $set: {
          title: req.body.title,
          stateId: req.body.stateId,
          stateName: stater ? stater.title : "",
          districtId: req.body.districtId,
          districtName: distr ? distr.title : "",
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );

    if (City) {
      res.status(200).json({
        success: true,
        message: "Constituency has been updated successfully",
      });
    }
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: err.message ?? "Bad request" });
  }
};

// delete Constituency
const deleteConstituency = async function (req, res) {
  try {
    const logDate = new Date().toISOString();
    const City = await constituteModel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          isdeleted: "Yes",
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );

    if (City) {
      res.status(200).json({
        success: true,
        message: "Constituency has been deleted successfully",
      });
    }
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: err.message ?? "Bad request" });
  }
};

module.exports = {
  addConstituency,
  deleteConstituency,
  editConstituency,
  getConstituency,
  getAllAppConstituenciesByDist,
  getAllConstituenciesByDist,
  getAllNonDeletedConstituency,
  getAllConstituencies,
};
