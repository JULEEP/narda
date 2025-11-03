const locationmodel = require("../models/locationmodel");

const createLocation = async function (req, res) {
  try {
    const create = await locationmodel.create({ name: req.body.name });
    if (!create)
      return res
        .status(400)
        .send({ status: false, message: "something went wrong" });
    return res.status(200).send({
      status: true,
      message: "Location created successfully",
      data: create,
    });
  } catch (err) {
    console.log(err.message);
    return res
      .status(400)
      .send({ status: false, message: "something went wrong" });
  }
};

// getAll admin locations
exports.getalladminlocations = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition = {
        $or: [{ name: regex }],
      };
    }
    console.log(condition);
    const locations = await locationmodel
      .find(condition)
      .sort({ createdAt: -1 });
    if (locations) {
      res.status(200).json({
        success: true,
        message: "Location's has been retrived successfully ",
        locations: locations,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//edit location
exports.editlocation = async function (req, res) {
  try {
    const logDate = new Date().toISOString();

    const faq = await locationmodel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          updatedAt: logDate,
        },
      },
      { new: true }
    );
    if (faq) {
      res.status(200).json({ success: true, message: "Updated successfully" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//delete location
exports.deletelocation = async function (req, res) {
  try {
    const faq = await locationmodel.findOneAndDelete({ _id: req.params.id });
    if (faq) {
      res.status(200).json({ success: true, message: "Deleted successfully" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Faq could not be deleted" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: "false", message: "Something went wrong" });
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////
const usermodel = require("../models/usermodel");
const getallocations = async function (req, res) {
  try {
    let subcategories = await locationmodel.find();
    console.log(subcategories);

    let userdata = await usermodel.findById({ _id: req.decoded.id });
    if (!userdata)
      return res.status(400).json({ status: false, message: "Please Login" });

    if (subcategories && subcategories.length > 0) {
      let categorizedSubcategories = subcategories.reduce(
        (acc, subcategory) => {
          const { categoryName, _id, name } = subcategory;

          // Check if the subcategory is in the user's categories array
          const isAdded = userdata.locations.includes(_id.toString());

          if (!acc[categoryName]) {
            acc[categoryName] = [];
          }

          acc[categoryName].push({ _id, name, isAdded });

          return acc;
        },
        {}
      );

      return res.status(200).send({
        status: true,
        message: "All locations fetched successfully",
        data: categorizedSubcategories,
      });
    }

    return res.status(404).send({ status: false, message: "Not Found" });
  } catch (err) {
    console.log(err.message);
    return res.status(404).send({ status: false, message: "Not Found" });
  }
};

module.exports.createLocation = createLocation;
module.exports.getallocations = getallocations;
