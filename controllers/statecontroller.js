const stateModel = require("../models/state");
const distmodel = require("../models/district");

// add a state
const addState = async function (req, res) {
  try {
    const logDate = new Date().toISOString();
    const state = await stateModel.findOne({
      title: { $regex: new RegExp(req.body.title, "i") },
      isdeleted: "No",
    });

    if (state !== null) {
      res.status(400).json({ message: "State already exist" });
    } else {
      const stateObj = new stateModel({
        title: req.body.title,
        logCreatedDate: logDate,
        logModifiedDate: logDate,
      });

      const saveState = await stateObj.save();
      if (saveState) {
        res.status(200).json({ message: "State added successfully" });
      } else {
        res.status(400).json({ message: "State Could not be added!" });
      }
    }
  } catch (err) {
    res.status(400).json({ message: "Something went wrong..!" });
  }
};

// get all states
const getAllStates = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery) {
      condition.title = regex;
    }
    condition.isdeleted = "No";
    console.log(condition);

    const states = await stateModel
      .find(condition)
      .sort({ logCreatedDate: -1 });

    res.status(200).json({
      success: true,
      message: "States have been retrieved successfully",
      states: states,
    });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: err.message ?? "Bad request" });
  }
};

// get all non deleted states
const getAllNonDeletedStates = async function (req, res) {
  try {
    const states = await stateModel
      .find({ isdeleted: "No" }, {})
      .sort({ logCreatedDate: -1 });

    res.status(200).json({
      success: true,
      message: "States have been retrieved successfully",
      states: states,
    });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: err.message ?? "Bad request" });
  }
};

// get all App non deleted states
const getAllAppNonDeletedStates = async function (req, res) {
  try {
    const states = await stateModel
      .find({ isdeleted: "No" }, {})
      .sort({ logCreatedDate: -1 });

    const statesdata = [];
    states.map((val) => {
      let obj = {
        _id: val._id,
        title: val.title,
        isdeleted: val.isdeleted,
        logCreatedDate: val.logCreatedDate,
        logModifiedDate: val.logModifiedDate,
      };
      statesdata.push(obj);
    });

    res.status(200).json({
      success: true,
      message: "States have been retrieved successfully",
      states: statesdata,
    });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: err.message ?? "Bad request" });
  }
};

// get state
const getState = async function (req, res) {
  try {
    const state = await stateModel.findOne({ _id: req.body._id });

    res.status(200).json({
      success: true,
      message: "State has been retrieved successfully",
      stateResult: state ?? {},
    });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: err.message ?? "Bad request" });
  }
};

// edit state
const editState = async function (req, res) {
  try {
    const logDate = new Date().toISOString();
    const state = await stateModel.updateOne(
      { _id: req.body.id },
      {
        $set: {
          title: req.body.title,
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );

    if (state) {
      res.status(200).json({
        success: true,
        message: "State has been updated successfully",
      });
    }
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: err.message ?? "Bad request" });
  }
};

const stateAndDistrict = async function (req, res) {
  try {
    let allStates = await stateModel.find().sort({ logCreatedDate: -1 });
    let allDistricts = await distmodel.find().sort({ logCreatedDate: -1 });

    let stateMap = {};
    allStates.forEach((state) => {
      stateMap[state._id] = state.title;
    });

    let stateDistrictMap = {};
    allStates.forEach((state) => {
      stateDistrictMap[state.title] = [];
    });

    allDistricts.forEach((district) => {
      let stateName = stateMap[district.stateId];
      if (stateName) {
        stateDistrictMap[stateName].push(district);
      }
    });

    res.status(200).json({ status: true, data: stateDistrictMap });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ status: false, message: err.message || "Bad request" });
  }
};

// delete state
const deleteState = async function (req, res) {
  try {
    const logDate = new Date().toISOString();
    const state = await stateModel.updateOne(
      { _id: req.body.id },
      {
        $set: {
          isdeleted: "Yes",
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );

    if (state) {
      res.status(200).json({
        success: true,
        message: "State has been deleted successfully",
      });
    }
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: err.message ?? "Bad request" });
  }
};

module.exports = {
  deleteState,
  stateAndDistrict,
  editState,
  getState,
  getAllAppNonDeletedStates,
  getAllNonDeletedStates,
  getAllStates,
  addState,
};
