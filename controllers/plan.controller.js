// importing models
const planModel = require("../models/plan");
const { DateTime } = require("luxon");

// add
exports.addplan = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const planObj = new planModel({
      name: req.body.name,
      image: req.file ? req.file.path : "",
      description: req.body.description,
      validity: req.body.validity,
      price: req.body.price,
      offerPrice: req.body.offerPrice,
      //   benfits
      benefits: JSON.parse(req.body.benefits),
      logCreatedDate: logDate,
      logModifiedDate: logDate,
    });

    const plan = await planObj.save();
    if (plan) {
      res.status(200).json({ success: true, message: "Plan has been added" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// get all plans
exports.getAllplans = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition = {
        $or: [{ name: regex }],
      };
    }
    console.log(condition);
    const plans = await planModel.find(condition).sort({
      logCreatedDate: -1,
    });
    if (plans) {
      res.status(200).json({
        success: true,
        message: "Plans have been retrived successfully",
        plans: plans,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// edit plan
exports.editplan = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const plan = await planModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          image: req.file ? req.file.path : console.log("No Img"),
          description: req.body.description,
          validity: req.body.validity,
          price: req.body.price,
          //   benfits
          benefits: JSON.parse(req.body.benefits),
          //   benefits:req.body.benefits
          offerPrice: req.body.offerPrice,
          logModifiedDate: logDate,
        },
      },
      {
        new: true,
      }
    );
    if (plan) {
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

// delete plan
exports.deleteplan = async function (req, res) {
  try {
    const plan = await planModel.findByIdAndDelete({
      _id: req.params.id,
    });
    if (plan) {
      res.status(200).json({ success: true, message: "Deleted successfully" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// get planbyid
exports.getplanbyid = async function (req, res) {
  try {
    const plan = await planModel.findOne(
      { _id: req.body.id },
      { __v: 0, logCreatedDate: 0, logModifiedDate: 0 }
    );

    if (plan) {
      res.status(200).json({
        success: true,
        message: "Plan details have been retrived",
        plan,
      });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};
