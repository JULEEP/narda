// importing models
const bannerModel = require("../models/bannerModel");

const addbanner = async function (req, res) {
  try {
    const logDate = new Date().toISOString();

    const bannerObj = new bannerModel({
      name: req.body.name,
      image: req.file ? req.file.path : "",
      type: req.body.type,
      link: req.body.link,
      createdDate: logDate,
      updatedAt: logDate,
    });

    const savebanner = await bannerObj.save();

    if (savebanner) {
      res
        .status(200)
        .json({ success: true, message: "Banner has been added successfully" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Banner could not be add" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

const getAllbanners = async function (req, res) {
 try {
    let condition = {};
    const searchQuery = req.query.searchQuery?.trim() || "";

    if (searchQuery !== "") {
      const regex = new RegExp(searchQuery, "i");
      condition = { $or: [{ name: regex }] };
    }

    // 🔹 Sort by newest first (descending order)
    const banners = await bannerModel
      .find(condition)
      .sort({ createdAt: -1 }); // or use createdDate if that's your field name

    if (!banners || banners.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No banners found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Banners retrieved successfully",
      banners,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching banners",
    });
  }
};

//edit
const editbanner = async function (req, res) {
  try {
    const logDate = new Date().toISOString();
    const banner = await bannerModel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          image: req.file ? req.file.path : console.log("No Img"),
          link: req.body.link,
          status: req.body.status,
          updatedAt: logDate,
        },
      },
      { new: true }
    );
    if (banner) {
      res
        .status(200)
        .json({ success: true, message: "Banner has been updated" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Banner could not be update" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

const deletebanner = async function (req, res) {
  try {
    const banner = await bannerModel.findOneAndDelete({ _id: req.params.id });
    if (banner) {
      res.status(200).json({ success: true, message: "Deleted successfully" });
    } else {
      res.status(400).json({ success: false, message: "Something went wrong" });
    }
  } catch (err) {
    res
      .status(400)
      .json({ success: "false", message: err.message ?? "Bad request" });
  }
};

module.exports.addbanner = addbanner;
module.exports.getAllbanners = getAllbanners;
module.exports.editbanner = editbanner;
module.exports.deletebanner = deletebanner;
