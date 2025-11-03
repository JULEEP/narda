const adimagemodel = require("../models/adimagemodel");
const postermodel = require("../models/postermodel");
const slidermodel = require("../models/slidermodel");
const likemodel = require("../models/likemodel");
const usermodel = require("../models/usermodel");
const reporterModel = require("../models/reportermodel");
const adsmodel = require("../models/adsmodel");
const adsImagemodel = require("../models/adsImagemodel");
const adsModel = require("../models/adsmodel");

const commentModel = require("../models/commentmodel");
const mongoose = require("mongoose");
const userFcmFunction = require("../utilis/fcmFunction");

//preventing adds to premium members
const paymentmodel = require("../models/paymentmodel");

const { DateTime } = require("luxon");

const createposter = async function (req, res) {
  try {
    const randomNumber = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    // Handle multiple uploaded files
    const files = req.files || [];
    const picturePaths = files.map((file) => file.path);

    // Fetch reporter
    const reporter = await reporterModel.findOne(
      { _id: req.body.reporterId },
      { name: 1 }
    );

    // Parse tags, category, and location
    const tags = req.body.tags ? req.body.tags.split(",") : [];
    const category = JSON.parse(req.body.category || "[]");
    const location = JSON.parse(req.body.location || "[]");

    const categoryIds = category.map(
      (cat) => new mongoose.Types.ObjectId(cat.value)
    );
    const locationIds = location.map(
      (loc) => new mongoose.Types.ObjectId(loc.value)
    );

    // ✅ Use expirydate safely (no timezone conversion needed)
    let expirydate = null;
    if (req.body.expirydate && !isNaN(Date.parse(req.body.expirydate))) {
      expirydate = new Date(req.body.expirydate);
    }

    // Set type field (default "general" if not provided)
    const type = req.body.type || "general";

    // Prepare object
    const object = {
      reporterId: req.body.reporterId,
      reporter: reporter ? reporter.name : "",
      createdBy: req.userId,
      posterId: "narpos" + randomNumber,
      category,
      categoryId: categoryIds,
      location,
      locationId: locationIds,
      tags,
      image: picturePaths,
      title: req.body.title || "",
      type, // ✅ added type field
      expirydate, // ✅ safe lowercase field
      createdAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      updatedAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    };

    // Save to DB
    const createdData = await postermodel.create(object);

    // Format expirydate for readable response (IST)
    const formattedExpiryDate = createdData.expirydate
      ? new Date(createdData.expirydate).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        })
      : null;

    // ✅ Response
    return res.status(200).json({
      success: true,
      message: "Poster created successfully ✅",
      poster: {
        _id: createdData._id,
        reporterId: createdData.reporterId,
        reporter: createdData.reporter,
        title: createdData.title,
        type: createdData.type, // ✅ include in response
        expirydate: formattedExpiryDate,
        category: createdData.category,
        location: createdData.location,
        image: createdData.image,
        createdAt: createdData.createdAt,
        updatedAt: createdData.updatedAt,
      },
    });
  } catch (err) {
    console.error("❌ Error creating poster:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 🕒 Helper function (for displaying formatted date later)
function formatDateTime(dateStr) {
  try {
    const date = new Date(dateStr);
    const convertedDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const formattedDate = convertedDate.toLocaleString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return formattedDate;
  } catch (error) {
    console.error("Error in formatDateTime:", error.message);
    return dateStr;
  }
}


const getposterbyid = async function (req, res) {
  try {
    const poster = await postermodel.find({ _id: req.body.id });

    const content = await commentModel.find({ contentId: poster[0]._id });

    console.log(req.body.id, " req.body.id");
    console.log(poster._id, "poster._id");
    console.log(content, "content");

    const defaultimage = "uploadsprofile.png";

    let dataaray = [];
    for (let i = 0; i < content.length; i++) {
      let userdata = await usermodel.findById({ _id: content[i].user });
      console.log(content[i].createdAt);
      let time = formatDateTime(content[i].createdAt);
      let obj = {
        _id: content[i]._id,
        name: content[i].name,
        comment: content[i].comment,
        image: userdata.profilepic ? userdata.profilepic : defaultimage,
        commentedAt: time,
      };
      console.log(content[i].createdAt, "commnetdatre");
      dataaray.push(obj);
    }

    if (poster) {
      console.log(req.body.id, "req.body.id");
      // console.log(comments,"comments");

      res.status(200).json({
        success: true,
        message: "Poster details has been retrived sucessfully",
        poster,
        comments: dataaray,
      });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

const updatePoster = async function (req, res) {
  try {
    console.log(req.params.id, "req.params");
    console.log(req.body, "req.body");
    let files = req.file;
    var picture;
    if (files) {
      picture = files.path;
      console.log(picture, "picture");
    } else {
      let data = await postermodel.findOne({ _id: req.params.id });
      picture = data.image;
    }

    console.log(picture, "picture");

    // Fetch reporter
    const reporterschema = await reporterModel.findOne(
      { _id: req.body.reporterId },
      { name: 1 }
    );
    // Default to empty array if req.body.tag is empty or undefined
    let tags = [];
    if (req.body.tags) {
      tags = req.body.tags.split(",");
    }
    var category = JSON.parse(req.body.category);
    var location = JSON.parse(req.body.location);
    const categoryIds = category.map(
      (cat) => new mongoose.Types.ObjectId(cat.value)
    );

    const locations = location.map(
      (loc) => new mongoose.Types.ObjectId(loc.value)
    );

    let object = {};
    object.reporterId = req.body.reporterId;
    object.reporter = reporterschema ? reporterschema.name : "";
    object.category = category;
    object.categoryId = categoryIds;
    object.location = location;
    object.locationId = locations;
    object.tags = tags;
    object.image = picture;

    console.log(object);

    let updatedData = await postermodel.findByIdAndUpdate(
      req.params.id,
      object,
      { new: true }
    );
    // if (updatedData) return res.status(200).send(updatedData);
    if (updatedData) {
      res.status(200).json({ success: true, message: "Updated successfully" });
    } else {
      res.status(400).json({ success: true, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    return res.status(404).send({ message: "Something went wrong" });
  }
};

// const createposter = async function (req, res) {
//   try {
//     console.log(req.body);
//     const randomNumber = Math.floor(Math.random() * 1000)
//       .toString()
//       .padStart(3, "0");
//     let files = req.files;
//     console.log(files);
//     let picture = files[0].path;
//     //req.body.createdBy = req.decoded.email;
//     req.body.posterId = "narpos" + randomNumber;
//     req.body.image = picture;
//     //   let crateddata = await postermodel.create(req.body);
//     //   if (crateddata) return res.status(200).send(crateddata);

//     // Fetch category
//     const reporterschema = await reporterModel.findOne(
//       { _id: req.body.reporterId },
//       { name: 1 }
//     );

//     const posterObj = new postermodel({
//       posterId: req.body.posterId,
//       //   sliders: req.body.sliders,
//       //sliders: uploadFiles.length > 0 ? imageArray : console.log("No Sliders"),
//       title: req.body.title,
//       createdBy: req.userId,
//       size: req.body.size,
//       reporterId: req.body.reporterId,
//       reporter: reporterschema ? reporterschema.name : "",
//       isDownload: req.body.isDownload,
//       visible: req.body.visible,
//       status: req.body.status,
//       tags: JSON.parse(req.body.tags),
//       topnews: req.body.topnews,
//       bookmark: req.body.bookmark,
//       likes: req.body.likes,
//       comments: req.body.comments,
//     });
//     if (saveSlider) {
//       res
//         .status(200)
//         .json({ success: true, message: "Poster created successfully" });
//     } else {
//       res.status(400).json({ success: false, message: "Bad request" });
//     }
//   } catch (err) {
//     return res.status(404).send({ message: err.message });
//   }
// };

const getAlladminposters = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");

    if (req.query.searchQuery !== "" && req.query.searchQuery !== undefined) {
      condition = {
        $or: [{ title: regex }],
      };
    }

    const posters = await postermodel.aggregate([
      { $match: condition },
      
    ]);

    posters.forEach((poster) => {
      // Parse using Luxon with matching format
      const dt = DateTime.fromFormat(poster.createdAt, "d/M/yyyy, h:mm:ss a", { zone: 'Asia/Kolkata' });
      
      poster.createdAt24 = dt.isValid ? dt.toJSDate() : null;
    });
    // Sort by createdAt24 descending (latest first)
    posters.sort((a, b) => b.createdAt24 - a.createdAt24);
    res.status(200).json({
      success: true,
      message: "Slider's have been retrieved successfully",
      posters: posters,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Something went wrong", error: err.message });
  }
};
const getposter = async function (req, res) {
  try {
    //console.log(req.params.id)
    const id = req.query.id;
    console.log(id);
    let poster = await postermodel.findById({ _id: id });
    let relatedposter = await postermodel.find();
    let relatedarray = [];
    for (let i = 0; i < relatedposter.length; i++) {
      let obj = {
        id: relatedposter[i]._id.toString(),
        video: relatedposter[i].image,
        title: relatedposter[i].title,
        bookmark: relatedposter[i].bookmark,
        time: relatedposter[i].timetoread,
      };
      relatedarray.push(obj);
    }

    if (poster) return res.status(200).json(poster);
    return res.status(404).send({ message: "Poster not found" });
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
};

const deleteadminposter = async function (req, res) {
  try {
    const poster = await postermodel.findByIdAndDelete({
      _id: req.params.id,
    });
    if (poster) {
      res.status(200).json({ success: true, message: "Deleted successfully" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};
const deleteposter = async function (req, res) {
  try {
    let id = req.body.id;
    const deletePoster = await postermodel.deleteOne({ _id: id });
    if (deletePoster)
      return res.status(204).send({ message: "Poster deleted" });
    return res.status(404).send({ message: "poster not found" });
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

const deletecomment = async function (req, res) {
  try {
    let id = req.body.id;
    const deletePoster = await commentModel.deleteOne({ _id: id });
    if (deletePoster)
      return res.status(200).send({ message: "Deleted Succesfully" });
    return res.status(404).send({ message: "Not found" });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

const getallposters = async function (req, res) {
  try {
    const userId = req.decoded.id;

    // ✅ Fetch user
    const usrdata = await usermodel.findById(userId);
    if (!usrdata) {
      return res.status(400).send({ status: false, message: "Please Login" });
    }

    // ✅ Fetch all active posters (newest first)
    const posters = await postermodel.find({}).sort({ createdAt: -1 });
    if (posters.length === 0) {
      return res.status(404).send({ status: false, message: "No posters found" });
    }

    // ✅ Fetch all active ads (any type)
    const ads = await adsmodel.find({ status: "active" }).sort({ createdAt: -1 });

    // ✅ Helper: Check if ad should be shown to this user
    const canShowAdToUser = (adUserType, user) => {
      const now = new Date();
      switch (adUserType) {
        case "both":
          return true;
        case "subscribed":
          // Only show if user is subscribed and plan not expired
          return user.subscribedUser === true && user.planExpiryDate && new Date(user.planExpiryDate) > now;
        case "unsubscribed":
          // Only show if user is NOT subscribed
          return user.subscribedUser === false;
        default:
          return false;
      }
    };

    const formattedPosters = [];
    let posterCount = 0;

    for (let i = 0; i < posters.length; i++) {
      const poster = posters[i];
      const likesArray = Array.isArray(poster.likes) ? poster.likes : [];
      const commentsArray = Array.isArray(poster.comments) ? poster.comments : [];
      const isLiked = likesArray.includes(userId);

      // ✅ Add poster
      formattedPosters.push({
        _id: poster._id,
        title: poster.title,
        url: poster.url,
        expiryDate: poster.expirydate,
        likes: likesArray.length,
        comments: commentsArray.length,
        type: "poster",
        isLiked,
        video: poster.video || null,
        image: poster.image || null,
        createdAt: poster.createdAt,
        updatedAt: poster.updatedAt
      });

      posterCount++;

      // ✅ Insert only eligible ads after posters
      ads.forEach(ad => {
        // Only ads meant for posters AND allowed for this user
        if (
          ad.type === "posters" &&
          canShowAdToUser(ad.userType, usrdata) &&
          posterCount % ad.showAfterPosters === 0
        ) {
          formattedPosters.push({
            _id: ad._id,
            title: ad.title || "",
            url: ad.url || "",
            expiryDate: ad.expiryDate || null,
            type: "ads",               // Main type = ads
            adsType: ad.type || "",    // Original type (posters/news)
            image: ad.image || [],
            createdAt: ad.createdAt,
            userType: ad.userType || "both",
            showAfterPosters: ad.showAfterPosters
          });
        }
      });
    }

    return res.status(200).send({
      status: true,
      data: formattedPosters,
      message: "Posters and Ads fetched successfully"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).send({
      status: false,
      message: "Something went wrong: " + err.message
    });
  }
};






const createAdsImage = async function (req, res) {
  try {
    const { url, type } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const newAd = new adsImagemodel({
      image: req.file.path,
      url,
      type,
      createdBy: req.userId, // from auth middleware
      status: "active",
      // expirydate is not taken from req.body anymore
    });

    const saved = await newAd.save();

    return res.status(201).json({
      success: true,
      message: "Ad Image created successfully",
      data: saved,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const getAllAdsImages = async function (req, res) {
  try {
    const ads = await adsImagemodel.find().sort({ createdAt: -1 }); // latest first

    return res.status(200).json({
      success: true,
      message: "Ads images fetched successfully",
      data: ads,
    });
  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching ads images",
    });
  }
};



exports.getAllAdsImagesWithQuery = async (req, res) => {
  try {
    const { type } = req.query; // Get type from query params

    // 🧩 Check if type is provided
    if (!type) {
      return res.status(200).json({
        success: true,
        message: "No type provided, no data shown by default",
        data: [], // Empty array if no type entered
      });
    }

    // ✅ Fetch only if type exists
    const ads = await adsImagemodel.find({ type }).sort({ createdAt: -1 });

    if (ads.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No ads found for type '${type}'`,
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: `Ads images fetched successfully for type '${type}'`,
      data: ads,
    });
  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching ads images",
    });
  }
};


const getadsimage = async function (req, res) {
  try {
    let ads = await adsImagemodel.findOne();

    return res.status(200).send({ status: true, data: ads });
  } catch (err) {
    return res.status(400).send({ status: false, message: "Not getting" });
  }
};

const getlatestposters = async function (req, res) {
  try {
    let posts = await postermodel.find().sort({ createdAt: -1 });
    console.log(posts, "postssss");
    if (posts) return res.status(200).send({ status: true, message: posts });
    console.log(posts, "possyts");
    return res.status(404).send({ status: false, message: "not found" });
  } catch (err) {
    return res.status(404).send({ status: false, message: err.message });
  }
};

const getalllikes = async function (req, res) {
  try {
    let poster = await postermodel.find({ createdBy: req.decoded.email });
    if (poster) {
      // console.log(poster)
      let likes = 0;
      let comments = 0;
      let views = 0;
      for (let i = 0; i < poster.length; i++) {
        //console.log(poster[i].likes)
        likes += poster[i].likes;
        comments += poster[i].comments;
        views += poster[i].views;
      }
      return res
        .status(200)
        .send({ message: { likes: likes, comments: comments, views: views } });
    }
    return res.status(404).send({ message: "not found" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

//update post status

///////////////////////////////////////
// UPATE
const updateposterstatus = async function (req, res) {
  try {
    const logDate = new Date().toISOString();
    const poster = await postermodel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          status: req.body.status,
          updatedAt: logDate,
        },
      },
      {
        new: true,
      }
    );
    if (poster) {
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
module.exports.createposter = createposter;
module.exports.getposter = getposter;
module.exports.deleteposter = deleteposter;
module.exports.getallposters = getallposters;
module.exports.getadsimage = getadsimage;
module.exports.getlatestposters = getlatestposters;
module.exports.getalllikes = getalllikes;
//
module.exports.getAlladminposters = getAlladminposters;
module.exports.getposterbyid = getposterbyid;
module.exports.updatePoster = updatePoster;
module.exports.deleteadminposter = deleteadminposter;
module.exports.updateposterstatus = updateposterstatus;
module.exports.deletecomment = deletecomment;


module.exports.createAdsImage = createAdsImage
module.exports.getAllAdsImages = getAllAdsImages


