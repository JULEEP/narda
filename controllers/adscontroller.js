const newsmoddel = require("../models/newsmodel");
const reporterModel = require("../models/reportermodel");
const bannerModel = require("../models/bannerModel");
const adsModel = require("../models/adsmodel");
const adsImagemodel = require("../models/adsImagemodel");
const striptags = require('striptags');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

function formatDateTime(dateStr) {
  const dateObj = new Date(dateStr);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("default", { month: "long" });
  const year = dateObj.getFullYear().toString().slice(-2);
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";

  const formattedDay =
    day +
    (day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th");
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = ("0" + minutes).slice(-2);

  return `${formattedDay} of ${month} ${year} ${formattedHours}:${formattedMinutes} ${ampm}`;
}

const create = async function (req, res) {
  try {
    const { title, description, type, url, userType, expiryDate, showAfterPosters } = req.body;

    // Validate required fields
    if (!title || !description || !url || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // Validate showAfterPosters
    const postersCount = parseInt(showAfterPosters) || 1;
    if (postersCount < 1 || postersCount > 50) {
      return res.status(400).json({
        success: false,
        message: "Show after posters count must be between 1 and 50"
      });
    }

    // Handling multiple or single file upload
    let imagePaths = [];

    if (req.files && req.files.length > 0) {
      // If multiple files are uploaded
      imagePaths = req.files.map(file => file.path);
    } else if (req.file) {
      // If only one file is uploaded
      imagePaths = [req.file.path];
    } else {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image"
      });
    }

    // Validate file count (max 5)
    if (imagePaths.length > 5) {
      return res.status(400).json({
        success: false,
        message: "You can only upload up to 5 files"
      });
    }

    // Create a new ad object
    const ad = new adsModel({
      title,
      createdBy: req.userId,
      description,
      type: type || "posters", // Default to posters
      url,
      image: imagePaths,  // Array of file paths
      status: "active",
      expiryDate,
      userType: userType || "both", // Default to both
      showAfterPosters: postersCount
    });

    // Save ad to the database
    const savedAd = await ad.save();

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Ad has been added successfully",
      data: savedAd,
    });
    
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: "Something went wrong",
      error: err.message
    });
  }
};
const update = async function (req, res) {
  try {
    const { title, description, type, url, _id, userType, expiryDate, showAfterPosters } = req.body;

    // Validate required fields
    if (!_id) {
      return res.status(400).json({ 
        success: false, 
        message: "Ad ID is required" 
      });
    }

    const getdata = await adsModel.findOne({ _id: new ObjectId(_id) });

    if (!getdata) {
      return res.status(404).json({ 
        success: false, 
        message: "Ad not found" 
      });
    }

    // Validate showAfterPosters if provided
    if (showAfterPosters) {
      const postersCount = parseInt(showAfterPosters);
      if (postersCount < 1 || postersCount > 50) {
        return res.status(400).json({
          success: false,
          message: "Show after posters count must be between 1 and 50"
        });
      }
    }

    // Handle multiple file uploads
    let imagePaths = getdata.image || []; // Keep existing images by default

    if (req.files && req.files.length > 0) {
      // If new files are uploaded, replace existing images
      imagePaths = req.files.map(file => file.path);
    } else if (req.file) {
      // If single file is uploaded
      imagePaths = [req.file.path];
    }
    // If no new files, keep existing images

    // Validate file count (max 5)
    if (imagePaths.length > 5) {
      return res.status(400).json({
        success: false,
        message: "You can only upload up to 5 files"
      });
    }

    // Prepare update data
    const updateData = {
      title: title || getdata.title,
      description: description || getdata.description,
      type: type || getdata.type,
      url: url || getdata.url,
      expiryDate: expiryDate || getdata.expiryDate,
      updatedBy: req.userId,
      userType: userType || getdata.userType,
      image: imagePaths,
      showAfterPosters: showAfterPosters ? parseInt(showAfterPosters) : getdata.showAfterPosters
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updated = await adsModel.findByIdAndUpdate(
      new ObjectId(_id),
      {
        $set: updateData
      },
      { new: true }
    );

    if (updated) {
      return res.status(200).json({
        success: true,
        message: "Ad has been updated successfully",
        data: updated,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to update the Ad",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ 
      success: false,
      message: "Something went wrong",
      error: err.message 
    });
  }
};

const adsImageUpdate = async function (req, res) {
  try {
    const { url, _id, type } = req.body;

    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Ad ID (_id) is required",
      });
    }

    const existingAd = await adsImagemodel.findById(_id);
    if (!existingAd) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    const updatedData = {
      updatedBy: req.userId,
      url,
      type,
      image: req.file ? req.file.path : existingAd.image,
    };

    const updated = await adsImagemodel.updateOne(
      { _id },
      { $set: updatedData }
    );

    if (updated.modifiedCount > 0) {
      return res.status(200).json({
        success: true,
        message: "Ad updated successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Ad update failed",
      });
    }
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



const getall = async function (req, res) {
    try {
      let allarticles = await adsModel.find().sort({ createdAt: -1 });
      if (allarticles.length)
        return res.status(200).send({ status: true,data: allarticles});
    } catch (error) {
      return res.status(400).send({ status: false, message: error.message });
    }
  };

  const getadsimage = async function (req, res) {
    try {
      let ads = await adsImagemodel.findOne();
  
      return res.status(200).send({ status: true, data:ads});
  
    } catch (err) {
      return res.status(400).send({ status: false, message:"Not getting" });
    }
  };

  
const deleteads = async (req, res) => {
    try {
      let id = req.body._id;

      console.log(id,"_id:66d32907dabb7aa923fb76a4");
      const deleteArticle = await adsModel.findByIdAndDelete(new ObjectId(id));

        return res.status(200).send({ message: "Deleted Successfully" });
     // return res.status(404).send({ message: "Article not found" });
    } catch (error) {
      return res.status(404).send({ message: error.message });
    }
  };

//   const updateExpiredAdds = async () => {
//   const expiryDate = new Date();
//   expiryDate.setHours(0, 0, 0, 0); 
//   const expiredSliders = await adsImagemodel.updateMany(
//     {
//       expiryDate: { $lte: expiryDate }
//     },
//     { $set: { status: "inactive" } }
//   );
//   console.log(`Updated ${expiredSliders.nModified} ads to inactive`);
//   }


// // Run the function daily at midnight
// const schedule = require('node-schedule');
// schedule.scheduleJob('*/10 * * * * *', updateExpiredAdds);



module.exports.createAds = create;
module.exports.update = update;
// module.exports.editnews = editnews;
// module.exports.getnews = getnews;
 module.exports.deleteads = deleteads;
// module.exports.getlatestnews = getlatestnews;
module.exports.getall = getall;
module.exports.adsImageUpdate = adsImageUpdate;
module.exports.getadsimage = getadsimage;

// //
// module.exports.getAlladminnews = getAlladminnews;
// module.exports.deleteadminnews = deleteadminnews;
// module.exports.updatenewsstatus = updatenewsstatus;
// module.exports.getsinglenewsbyid = getsinglenewsbyid;
// module.exports.addnews = addnews;
//module.exports.updatenews = updatenews;
