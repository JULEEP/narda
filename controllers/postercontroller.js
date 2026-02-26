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
const sendPushNotification = require('../utilis/sendNotification'); // Step 2


const { DateTime } = require("luxon");

const createposter = async function (req, res) {
  try {
    // 🔹 Random poster number
    const randomNumber = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    // 🔹 Files
    const files = req.files || [];
    const picturePaths = files.map((file) => file.path);

    // 🔹 Reporter
    const reporter = await reporterModel.findOne(
      { _id: req.body.reporterId },
      { name: 1 }
    );

    // 🔹 Parse fields
    const tags = req.body.tags ? req.body.tags.split(",") : [];
    const category = JSON.parse(req.body.category || "[]");
    const location = JSON.parse(req.body.location || "[]");

    const categoryIds = category.map(
      (cat) => new mongoose.Types.ObjectId(cat.value)
    );
    const locationIds = location.map(
      (loc) => new mongoose.Types.ObjectId(loc.value)
    );

    // 🔹 Expiry date
    let expirydate = null;
    if (req.body.expirydate && !isNaN(Date.parse(req.body.expirydate))) {
      expirydate = new Date(req.body.expirydate);
    }

    const type = req.body.type || "general";

    // 🔹 Poster object
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
      type,
      expirydate,
      createdAt: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
      updatedAt: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
    };

    // ✅ Save poster
    const createdData = await postermodel.create(object);

    // ================= PUSH NOTIFICATION =================

    // 🔹 Fetch users with FCM token
    const users = await usermodel.find(
      { fcm_token: { $exists: true, $ne: null } },
      { _id: 1, fcm_token: 1 }
    );

    const fcmTokens = users.map((u) => u.fcm_token).filter(Boolean);

    // 🔥 BASIC LOGS
    console.log("📢 PUSH NOTIFICATION STARTED");
    console.log("Poster ID:", createdData._id.toString());
    console.log("Total users found:", users.length);
    console.log("Total valid FCM tokens:", fcmTokens.length);

    // 🔥 USER LIST LOG
    if (users.length > 0) {
      console.log(
        "Users with FCM token:",
        users.map((u) => ({
          userId: u._id.toString(),
          fcm_token: u.fcm_token,
        }))
      );
    }

    let firebaseResponse = null;

    if (fcmTokens.length > 0) {
      const title = "New Poster Created";
      const body = `A new poster titled "${createdData.title}" has been added.`;
      const data = { posterId: createdData._id.toString() };

      // 🔥 MESSAGE LOG
      console.log("📨 PUSH PAYLOAD");
      console.log({
        title,
        body,
        data,
      });

      // 🔥 Send push
      firebaseResponse = await sendPushNotification(
        fcmTokens,
        title,
        body,
        data
      );

      // 🔥 Firebase response log
      console.log("🔥 FIREBASE RESPONSE");
      console.log(JSON.stringify(firebaseResponse, null, 2));

      if (firebaseResponse) {
        console.log("✅ PUSH SUMMARY");
        console.log("Success Count:", firebaseResponse.successCount);
        console.log("Failure Count:", firebaseResponse.failureCount);

        if (firebaseResponse.responses) {
          firebaseResponse.responses.forEach((r, index) => {
            if (r.success) {
              console.log(`✔ Token ${index + 1}: Delivered`);
            } else {
              console.log(
                `❌ Token ${index + 1}: Failed →`,
                r.error?.message || r.error
              );
            }
          });
        }
      }
    } else {
      console.log("⚠️ No valid FCM tokens found. Push skipped.");
    }

    // ================= RESPONSE =================

    const formattedExpiryDate = createdData.expirydate
      ? new Date(createdData.expirydate).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        })
      : null;

    return res.status(200).json({
      success: true,
      message: "Poster created successfully ✅",
      poster: {
        _id: createdData._id,
        reporterId: createdData.reporterId,
        reporter: createdData.reporter,
        title: createdData.title,
        type: createdData.type,
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
    return res.status(500).json({
      success: false,
      message: err.message,
    });
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

    // ✅ Validate user
    const usrdata = await usermodel.findById(userId);
    if (!usrdata)
      return res.status(400).send({ status: false, message: "Please Login" });

    // ✅ Fetch posters
    const posters = await postermodel.find({}).sort({ createdAt: -1 });
    if (!posters.length)
      return res.status(404).send({ status: false, message: "No posters found" });

    // ✅ Fetch active ads & sliders
    const ads = await adsmodel.find({ status: "active" }).sort({ createdAt: -1 });
    const sliders = await slidermodel.find({ status: "active" }).sort({ createdAt: 1 }); // oldest first

    const formattedPosters = [];
    let posterCount = 0;

    // ✅ Calculate dynamic slider positions (gap of 4 posters)
    const gap = 4;
    const sliderPositions = sliders.map((_, i) => (i + 1) * gap);
    let sliderIndex = 0;

    for (let poster of posters) {
      posterCount++;

      // ✅ Poster likes
      const likes = await likemodel.find({ contentId: poster._id.toString(), type: "poster" });
      const totalLikes = likes.length;
      const isLiked = likes.some(like => like.userId.toString() === userId.toString());

      // ✅ Poster comments
      const totalComments = Array.isArray(poster.comments)
        ? poster.comments.length
        : poster.comments || 0;

      // ✅ Push poster
      formattedPosters.push({
        _id: poster._id,
        title: poster.title,
        url: poster.url,
        expiryDate: poster.expirydate,
        likes: totalLikes,
        comments: totalComments,
        type: "poster",
        isLiked,
        video: poster.video || null,
        image: poster.image || null,
        createdAt: poster.createdAt,
        updatedAt: poster.updatedAt,
      });

      // ✅ Insert Ads after specific number of posters
      for (let ad of ads) {
        if (["ads", "posters"].includes(ad.type) && posterCount === ad.showAfterPosters) {
          formattedPosters.push({
            _id: ad._id,
            title: ad.title || "",
            url: ad.url || "",
            type: "ads",
            adsType: ad.type,
            image: ad.image || [],
            description: ad.description || "",
            createdAt: ad.createdAt,
            userType: ad.userType || "both",
            showAfterPosters: ad.showAfterPosters,
          });
        }
      }

      // ✅ Insert slider dynamically (ignore DB position)
      if (sliderIndex < sliders.length && posterCount === sliderPositions[sliderIndex]) {
        const slider = sliders[sliderIndex];

        // Slider likes
        const sliderLikes = await likemodel.find({
          contentId: slider._id.toString(),
          type: "slider",
        });
        const totalSliderLikes = sliderLikes.length;
        const isSliderLiked = sliderLikes.some(
          like => like.userId.toString() === userId.toString()
        );

        // Slider comments & views
        const totalComments =
          typeof slider.comments === "number"
            ? slider.comments
            : Array.isArray(slider.comments)
            ? slider.comments.length
            : 0;

        formattedPosters.push({
          _id: slider._id,
          title: slider.title,
          sliders: slider.sliders || [],
          type: "slider",
          likes: totalSliderLikes,
          comments: totalComments,
          views: slider.views || 0,
          isLiked: isSliderLiked,
          createdAt: slider.createdAt,
          updatedAt: slider.updatedAt,
        });

        sliderIndex++; // move to next slider
      }
    }

    return res.status(200).send({
      status: true,
      data: formattedPosters,
      message: "Posters fetched with likes ✅",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ status: false, message: err.message });
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




const deleteAdsImage = async function (req, res) {
  try {
    const { id } = req.params; // ID from URL

    const deletedAd = await adsImagemodel.findByIdAndDelete(id);

    if (!deletedAd) {
      return res.status(404).json({
        success: false,
        message: "Ad image not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ad image deleted successfully",
      data: deletedAd,
    });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting ad image",
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
    // 1️⃣ Fetch all posts (latest first)
    const posts = await postermodel.find().sort({ createdAt: -1 });

    // 2️⃣ Fetch all ads (latest first)
    const ads = await adsModel.find().sort({ createdAt: -1 });

    // 3️⃣ Merge logic
    let combinedFeed = [];
    let postIndex = 0;

    for (const ad of ads) {
      const showAfter = ad.showAfterPosters || 1; // default 1 if missing

      // Add 'showAfter' number of posts
      const postsToAdd = posts.slice(postIndex, postIndex + showAfter);
      combinedFeed.push(...postsToAdd);
      postIndex += showAfter;

      // Add this ad
      combinedFeed.push({
        ...ad._doc, // Spread ad fields
        isAd: true, // Mark for frontend distinction
      });
    }

    // 4️⃣ Add any remaining posts (if posts > ads total)
    if (postIndex < posts.length) {
      combinedFeed.push(...posts.slice(postIndex));
    }

    // 5️⃣ Return the combined feed
    return res.status(200).json({
      status: true,
      data: combinedFeed,
    });
  } catch (error) {
    console.error("Error generating feed:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
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
module.exports.deleteAdsImage = deleteAdsImage



