const newsmoddel = require("../models/newsmodel");
const admodel = require("../models/adimagemodel");
const stateModel = require("../models/state");
const districtModel = require("../models/district");
const constitModel = require("../models/constituency");
const reporterModel = require("../models/reportermodel");
const bannerModel = require("../models/bannerModel");
const locationmodel = require("../models/locationmodel");
const adsmodel = require("../models/adsmodel");
const paymentmodel = require("../models/paymentmodel");
const striptags = require('striptags');
const moment = require("moment-timezone");
const mongoose = require("mongoose");

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
/*
const createNews = async function (req, res) {
  //console.log(req.decoded, "from artcile")
  try {
    let stateIds = [];
    let stateNames = [];
    let stateCondition = {};
    if (req.body.stateId !== "All") {
      stateCondition._id = { $in: req.body.stateId };
    }
    stateCondition.isdeleted = "No";
    const stater = await stateModel.find(stateCondition, { title: 1 });
    stater.map((val) => {
      stateIds.push(val._id);
      stateNames.push(val.title);
    });
    let statesObj = stater.map((val) => {
      return { value: val._id.toString(), label: val.title };
    });

    let districtIds = [];
    let districtNames = [];
    let districtCondition = {};
    if (req.body.stateId !== "All") {
      districtCondition.stateId = { $in: req.body.stateId };
    }
    if (req.body.districtId !== "All") {
      districtCondition._id = { $in: req.body.districtId };
    }
    districtCondition.isdeleted = "No";
    // console.log(districtCondition);
    const distr = await districtModel.find(districtCondition, { title: 1 });
    distr.map((val) => {
      districtIds.push(val._id);
      districtNames.push(val.title);
    });
    let districtObj = distr.map((val) => {
      return { value: val._id.toString(), label: val.title };
    });


    let constitIds = [];
    let constitNames = [];
    let constitCondition = {};
    if (req.body.stateId !== "All") {
      constitCondition.stateId = { $in: req.body.stateId };
    }
    if (req.body.districtId !== "All") {
      constitCondition.districtId = { $in: req.body.districtId };
    }
    if (req.body.constituencyId !== "All") {
      constitCondition._id = { $in: req.body.constituencyId };
    }
    constitCondition.isdeleted = "No";
    // console.log(constitCondition);
    const constitr = await constitModel.find(constitCondition, { title: 1 });
    constitr.map((val) => {
      constitIds.push(val._id);
      constitNames.push(val.title);
    });
    let constitObj = constitr.map((val) => {
      return { value: val._id.toString(), label: val.title };
    });
    let files = req.files;
    let picture = files[0].path;
    req.body.banner = files[1].path;
    // req.body.createdBy = req.decoded.email;
    req.body.createdBy = req.userId;
    req.body.data = [{ image: picture, content: req.body.description }];
    // state
    (req.body.stateId = stateIds),
      (req.body.stateName = stateNames),
      (req.body.stateObj = statesObj),
      // districts
      (req.body.districtId = districtIds),
      (req.body.districtName = districtNames),
      (req.body.districtObj = districtObj),
      // constituency
      (req.body.constituencyId = constitIds),
      (req.body.constituencyName = constitNames),
      (req.body.constituencyObj = constitObj);

    let cratearticle = await newsmoddel.create(req.body);
    if (cratearticle) return res.status(200).send(cratearticle);
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};
*/
const createNews = async function (req, res) {
  try {
    const {
      reporterId,
      title,
      shortdescription,
      description,
      allcontent,
      isPremium,
      ispublished,
      topnews,
      timetoread,
      category,
      location,
      tagsArray,
      allowCopy
    } = req.body;

    console.log("=== NEWS CREATION STARTED ===");
    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.files);

    // Validate required fields
    if (!title || !reporterId || !shortdescription || !description || !allcontent) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    const reporterschema = await reporterModel.findOne(
      { _id: reporterId },
      { name: 1 }
    );

    if (!reporterschema) {
      return res.status(404).json({
        success: false,
        message: "Reporter not found"
      });
    }

    // Parse category and location
    let parsedCategory = [];
    let parsedLocation = [];
    
    try {
      parsedCategory = category ? JSON.parse(category) : [];
      parsedLocation = location ? JSON.parse(location) : [];
    } catch (parseError) {
      console.log("Parse error:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid category or location format"
      });
    }

    const categoryIds = parsedCategory.map(cat => new mongoose.Types.ObjectId(cat.value));
    const locations = parsedLocation.map(loc => new mongoose.Types.ObjectId(loc.value));

    // File handling
    let mainImages = [];
    let middleImagePath = "";

    console.log("Files received:", req.files);

    // Main images handling
    if (req.files && req.files['image']) {
      mainImages = req.files['image'].map(file => file.path);
      console.log("Main images paths:", mainImages);
    }

    // Middle image handling
    if (req.files && req.files['middleImage'] && req.files['middleImage'][0]) {
      middleImagePath = req.files['middleImage'][0].path;
      console.log("Middle image path:", middleImagePath);
    }

    // Validate at least one main image is uploaded
    if (mainImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one main image"
      });
    }

    // Parse tags array
    let tagsArrayParsed = [];
    if (tagsArray) {
      try {
        if (typeof tagsArray === 'string') {
          tagsArrayParsed = JSON.parse(tagsArray);
        } else if (Array.isArray(tagsArray)) {
          tagsArrayParsed = tagsArray;
        }
      } catch (e) {
        console.log("Tags parse error:", e);
        tagsArrayParsed = typeof tagsArray === 'string' ? [tagsArray] : [];
      }
    }

    // Validate allowCopy field
    const validAllowCopyValues = ["both", "subscribed", "unsubscribed", "none"];
    const finalAllowCopy = validAllowCopyValues.includes(allowCopy) ? allowCopy : "both";

    const cratearticleObj = new newsmoddel({
      reporterId: reporterId,
      reporter: reporterschema.name,
      title: title,
      createdBy: req.userId,
      shortdescription: shortdescription,
      description: description,
      allcontent: allcontent,
      isPremium: isPremium === "true",
      ispublished: ispublished === "true",
      topnews: topnews === "true",
      image: mainImages,
      middleImage: middleImagePath,
      timetoread: timetoread,
      category: parsedCategory,
      categoryId: categoryIds,
      location: parsedLocation,
      locationId: locations,
      tags: tagsArrayParsed,
      allowCopy: finalAllowCopy,
      status: "active",
      createdAt: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
    });

    const saveArticele = await cratearticleObj.save();
    
    console.log("=== NEWS CREATED SUCCESSFULLY ===");
    if (saveArticele) {
      return res.status(200).json({
        success: true,
        message: "News has been added successfully",
        data: saveArticele
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to save news"
      });
    }

  } catch (err) {
    console.log("Error in createNews:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message
    });
  }
};
const addmore = async function (req, res) {
  try {
    if (req.files && req.files.length > 0) {
      let files = req.files;
      let picture = files[0].path;
      dataarray = { image: picture, content: req.body.description };
    }
    dataarray = { content: req.body.description };
    let addedarticle = await newsmoddel.findByIdAndUpdate(
      { _id: req.body.id },
      { $push: { data: dataarray } },
      { new: true }
    );
    if (addedarticle) return res.status(200).send(addedarticle);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
};

const editnews = async function (req, res) {
  try {
    const reporterschema = await reporterModel.findOne(
      { _id: req.body.reporterId },
      { name: 1 }
    );

    console.log("hello", req.body.category);

    var category = JSON.parse(req.body.category);
    var location = JSON.parse(req.body.location);
    const categoryIds = category.map(cat => new mongoose.Types.ObjectId(cat.value));

    const locations = location.map(loc => new mongoose.Types.ObjectId(loc.value));

    const files = req.files.map(file => file.path);

    let tagsArray = [];
    if (req.body.tagsArray) {
      tagsArray = req.body.tagsArray.split(",");
    }

    const object = {
      reporterId: req.body.reporterId,
      reporter: reporterschema ? reporterschema.name : "",
      title: req.body.title,
      createdBy: req.userId,
      shortdescription: req.body.shortdescription,
      description: req.body.description,
      isPremium: req.body.isPremium,
      ispublished: req.body.ispublished,
      topnews: req.body.topnews,
      image: files,
      timetoread: req.body.timetoread,
      allcontent: req.body.allcontent,
      category: category,
      categoryId: categoryIds,
      location: location,
      locationId: locations,
      tags: tagsArray,
      createdAt:  moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
    };

    const editedArticle = await newsmoddel.findByIdAndUpdate(
      req.body.id,
      { $set: object },
      { new: true }
    );

    if (editedArticle) {
      return res.status(200).json({ success: true, message: "News has been updated successfully" });
    } else {
      return res.status(404).json({ message: "Article not found" });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "Something went wrong" });
  }
};

const getnews = async function (req, res) {
  try {
    //console.log(req.params.id)
    const id = req.query.id;
    console.log(id);
    let article = await newsmoddel.findById(new mongoose.Types.ObjectId(id));
    const relatednews = await newsmoddel.find().sort({ updatedAt: -1 });
    let relatedarray = [];
    for (let i = 0; i < relatednews.length; i++) {
      const obj = {
        id: relatednews[i]._id.toString(),
        Image: relatednews[i].image[0]
          ? relatednews[i].image[0]
          : "uploads\noimage.jpg",
        title: relatednews[i].title,
        description: relatednews[i].allcontent
          ? relatednews[i].allcontent
          : "",
        // Image: relatednews[i].data[0].image
        //   ? relatednews[i].data[0].image
        //   : "uploads\noimage.jpg",
        // title: relatednews[i].title,
        // description: relatednews[i].data[0].content
        //   ? relatednews[i].data[0].content
        //   : "",
        bookmark: relatednews[i].bookmark,
        time: relatednews[i].timetoread,
        createdAt: relatednews[i].createdAt,
        updatedAt: relatednews[i].updatedAt,
      };
      relatedarray.push(obj);
    }
    if (article)
      return res.status(200).send({ article, relatedarray: relatedarray });
    return res.status(404).send({ message: "Article not found" });
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
};

const deletenews = async (req, res) => {
  try {
    let id = req.body.id;
    const deleteArticle = await newsmoddel.deleteOne({ _id: id });
    if (deleteArticle)
      return res.status(204).send({ message: "Article deleted" });
    return res.status(404).send({ message: "Article not found" });
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

// const getlatestnews= async (req, res) => {
//    try{
//       let posts= await newsmoddel.find().sort({createdAt: -1})
//       // console.log(posts, "postssss")
//       if(posts) return res.status(200).send({status:true, message:posts})
//          //  console.log(posts, "possyts")
//       return res.status(404).send({status:false, message: "not found"})

//   }catch(err){
//       return res.status(404).send({status:false, message: err.message})
//   }
// }
const usermodel = require("../models/usermodel");
const newsmodel = require("../models/newsmodel");
const categorymodel = require("../models/categorymodel");
const getlatestnews = async function (req, res) {
  try {
    console.log(req.decoded.id);
    const userId = req.decoded.id;

    // ✅ Fetch user details
    const usrdata = await usermodel.findById({ _id: req.decoded.id });
    if (!usrdata)
      return res.status(400).send({ status: false, message: "please Login" });

    console.log("User found:", usrdata._id.toString());

    let adds = [];
    let adImages = [];

    // ✅ Fetch news and ads
    let allnews = await newsmoddel.find().sort({ createdAt: -1 });
    let topnews = await newsmoddel.find({ topnews: true }).sort({ createdAt: -1 });
    adImages = await bannerModel.find({}).lean();
    adds = await adsmodel.find({ type: "news" }).sort({ createdAt: -1 });

    const latestarray = [];
    let j = 0;

    // ✅ Helper function for copy permissions
    const canUserCopy = (newsAllowCopy, user) => {
      const now = new Date();

      switch (newsAllowCopy) {
        case "both":
          return true;
        case "subscribed":
          return (
            user.subscribedUser === true &&
            user.planExpiryDate &&
            new Date(user.planExpiryDate) > now
          );
        case "unsubscribed":
          return user.subscribedUser === false;
        case "none":
        default:
          return false;
      }
    };

    // ✅ Loop through all news
    for (let i = 0; i < allnews.length; i++) {
      const newsItem = allnews[i];

      const newsObj = {
        id: newsItem._id.toString(),
        Image: newsItem.image
          ? Array.isArray(newsItem.image)
            ? newsItem.image
            : [newsItem.image]
          : ["uploads/noimage.jpg"],
        title: newsItem.title || "",
        description: newsItem.allcontent || "",
        shortdescription: newsItem.allcontent ? striptags(newsItem.allcontent) : "",
        bookmark: newsItem.bookmark || false,
        time: newsItem.timetoread || "",
        premium: newsItem.isPremium || false,
        createdAt: newsItem.createdAt,
        type: "news",
        url: "",
        // ✅ Added same allowCopy logic
        allowCopy: canUserCopy(newsItem.allowCopy, usrdata),
      };

      latestarray.push(newsObj);

      // ✅ Insert ad after every 3 news items
      if (i % 3 === 0 && adds.length > 0 && j < adds.length) {
        const adItem = adds[j];
        const adObj = {
          id: adItem._id.toString(),
          Image: adItem.image
            ? Array.isArray(adItem.image)
              ? adItem.image
              : [adItem.image]
            : ["uploads/noimage.jpg"],
          title: adItem.title || "",
          description: adItem.description || "",
          bookmark: "",
          time: "",
          premium: false,
          createdAt: adItem.createdAt
            ? new Date(adItem.createdAt).toLocaleString()
            : "",
          type: "add",
          url: adItem.url || "",
          allowCopy: false, // ✅ Ads never allow copy
        };
        latestarray.push(adObj);
        j++;
      }
    }

    // ✅ Top news with allowCopy added
    const topnewsdata = topnews.map(item => ({
      id: item._id.toString(),
      Image: item.image
        ? Array.isArray(item.image)
          ? item.image
          : [item.image]
        : ["uploads/noimage.jpg"],
      title: item.title || "",
      description: item.allcontent || "",
      shortdescription: item.allcontent ? striptags(item.allcontent) : "",
      bookmark: item.bookmark || false,
      time: item.timetoread || "",
      premium: item.isPremium || false,
      createdAt: item.createdAt,
      type: "news",
      url: "",
      allowCopy: canUserCopy(item.allowCopy, usrdata), // ✅ same logic
    }));

    // ✅ Banners unchanged
    const banners = adImages
      .filter(banner => !banner.video)
      .map(banner => ({
        ...banner,
        Image: banner.image
          ? Array.isArray(banner.image)
            ? banner.image
            : [banner.image]
          : ["uploads/noimage.jpg"],
      }));

    return res.status(200).send({
      status: true,
      latest: latestarray,
      top: topnewsdata,
      banners,
    });

  } catch (err) {
    console.error("Error in getlatestnews:", err);
    return res
      .status(500)
      .send({ status: false, message: err.message || "Internal Server Error" });
  }
};




const getall = async function (req, res) {
  console.log("hitting getall");
  try {
    let allarticles = await newsmoddel.find().sort({ createdAt: -1 });
    console.log(allarticles.length);
   
    const dataArray = [];


    for (let i = 0; i < allarticles.length; i++) {
       console.log("entered the for loop")
        
      const obj = {
        id: allarticles[i]._id.toString(),

        // Image: allarticles[i].data[0].image
        //   ? allarticles[i].data[0].image
        //   : "uploads\noimage.jpg",
        Image: allarticles[i].image[0]
          ? allarticles[i].image[0]
          : "uploads\noimage.jpg",
        title: allarticles[i].title,
        // description: allarticles[i].data[0].content
        //   ? allarticles[i].data[0].content
        //   : "",
        description: allarticles[i].allcontent
          ? allarticles[i].allcontent
          : "",
        bookmark: allarticles[i].bookmark,
        time: allarticles[i].timetoread,
        createdAt: allarticles[i].createdAt,
        updatedAt: allarticles[i].updatedAt,
      };
      
      dataArray.push(obj);
    }
    //console.log(dataArray)
    if (allarticles.length)
      return res.status(200).send({ status: true, data: dataArray });
  } catch (error) {
    return res.status(400).send({ status: false, message: error.message });
  }
};

const getAlladminnews = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition = {
        $or: [{ title: regex }],
      };
    }

    console.log(condition);
    const news = await newsmoddel.find(condition).sort({
      createdAt: -1,
    });
    if (news) {
      res.status(200).json({
        success: true,
        message: "News's have been retrived successfully ",
        news: news,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

const deleteadminnews = async function (req, res) {
  try {
    const plan = await newsmoddel.findByIdAndDelete({
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

// UPATE
const updatenewsstatus = async function (req, res) {
  try {
    const logDate = new Date().toISOString();
    const poster = await newsmoddel.findByIdAndUpdate(
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

const getsinglenewsbyid = async function (req, res) {
  try {
    const news = await newsmoddel.findOne({ _id: req.body.id });

    if (news) {
      res.status(200).json({
        success: true,
        message: "News details has been retrived sucessfully",
        news,
      });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//--------------------- ADD NEW -----------------------//
// const addnews = async function (req, res) {
//   try {
//     const logDate = new Date().toISOString();

//     // fetch reporter
//     const reporterschema = await reporterModel.findOne(
//       { _id: req.body.reporterId },
//       { name: 1 }
//     );

//     // fetch state
//     const stateschema = await stateModel.findOne(
//       { _id: req.body.stateId },
//       { title: 1 }
//     );

//     // fetch state
//     const districtschema = await districtModel.findOne(
//       { _id: req.body.districtId },
//       { title: 1 }
//     );

//     // fetch category
//     const categoryschema = await categorymodel.findOne(
//       { _id: req.body.categoryId },
//       { name: 1 }
//     );

//     // fetch category
//     const locationschema = await locationmodel.findOne(
//       { _id: req.body.location },
//       { name: 1 }
//     );

//     // Default to empty array if req.body.tag is empty or undefined
//     let tags = [];
//     if (req.body.tags) {
//       tags = req.body.tags.split(",");
//     }
//     // image for multiple purpose
//     let imageArray = [];
//     const uploadFiles = req.files && req.files.image ? req.files.image : [];
//     uploadFiles.map((item) => {
//       imageArray.push(item.path);
//     });

//     // Fetch categories and create a comma-separated string of category names
//     let categoryName = "";
//     if (req.body.category) {
//       const category = req.body.category.split(",");
//       const categories = await categorymodel.find(
//         { _id: { $in: category } },
//         { name: 1 }
//       );
//       categoryName = categories.map((category) => category.name).join(", ");
//     }

//     const newsObj = new newsmoddel({
//       title: req.body.title,
//       createdBy: req.userId,
//       // reporter
//       reporterId: req.body.reporterId,
//       reporter: reporterschema ? reporterschema.name : "",
//       // state
//       stateId: req.body.stateId,
//       stateName: stateschema ? stateschema.title : "",
//       // district
//       districtId: req.body.districtId,
//       districtName: districtschema ? districtschema.title : "",
//       // category objectid
//       // category: req.body.category,
//       // categoryName: categoryschema ? categoryschema.name : "",
//       category: req.body.category,
//       categoryName: categoryName,
//       //objectid
//       location: req.body.location,
//       locationName: locationschema ? locationschema.name : "",
//       //
//       image: uploadFiles.length > 0 ? imageArray : console.log("No Img"),
//       //
//       banner: req.files.banner
//         ? req.files.banner[0].path
//         : console.log("No Img"),
//       //
//       tags: tags,
//       allcontent: req.body.allcontent,
//       bookmark: req.body.bookmark,
//       timetoread: req.body.timetoread,
//       isPremium: req.body.isPremium,
//       ispublished: req.body.ispublished,
//       topnews: req.body.topnews,
//       createdAt: logDate,
//       updatedAt: logDate,
//     });

//     const saveNews = await newsObj.save();
//     if (saveNews) {
//       res.status(200).json({
//         success: true,
//         message: "New's creared sucessfully",
//         saveNews,
//       });
//     } else {
//       res.status(400).json({ success: false, message: "Bad request" });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({ success: false, message: "Something went wrong" });
//   }
// };

//update the news
const updatenews = async function (req, res) {
  try {
    const logDate = new Date().toISOString();
    console.log("=== NEWS UPDATE STARTED ===");
    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.files);

    const reporterschema = await reporterModel.findOne(
      { _id: req.body.reporterId },
      { name: 1 }
    );

    const articleId = req.params.id;
    
    // Parse category and location
    let parsedCategory = [];
    let parsedLocation = [];
    
    try {
      parsedCategory = req.body.category ? JSON.parse(req.body.category) : [];
      parsedLocation = req.body.location ? JSON.parse(req.body.location) : [];
    } catch (parseError) {
      console.log("Parse error:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid category or location format"
      });
    }

    const categoryIds = parsedCategory.map(cat => new mongoose.Types.ObjectId(cat.value));
    const locations = parsedLocation.map(loc => new mongoose.Types.ObjectId(loc.value));

    // File handling
    let mainImages = [];
    let middleImagePath = "";

    console.log("Files received:", req.files);

    // Main images handling - if new files are uploaded
    if (req.files && req.files['image']) {
      mainImages = req.files['image'].map(file => file.path);
      console.log("New main images paths:", mainImages);
    }

    // Middle image handling
    if (req.files && req.files['middleImage'] && req.files['middleImage'][0]) {
      middleImagePath = req.files['middleImage'][0].path;
      console.log("New middle image path:", middleImagePath);
    }

    // Parse tags array
    let tagsArrayParsed = [];
    if (req.body.tagsArray) {
      try {
        if (typeof req.body.tagsArray === 'string') {
          tagsArrayParsed = JSON.parse(req.body.tagsArray);
        } else if (Array.isArray(req.body.tagsArray)) {
          tagsArrayParsed = req.body.tagsArray;
        }
      } catch (e) {
        console.log("Tags parse error:", e);
        tagsArrayParsed = typeof req.body.tagsArray === 'string' ? [req.body.tagsArray] : [];
      }
    }

    // Validate allowCopy field
    const validAllowCopyValues = ["both", "subscribed", "unsubscribed", "none"];
    const finalAllowCopy = validAllowCopyValues.includes(req.body.allowCopy) ? req.body.allowCopy : "both";

    // Build update object
    const object = {
      reporterId: req.body.reporterId,
      reporter: reporterschema ? reporterschema.name : "",
      title: req.body.title,
      createdBy: req.userId,
      shortdescription: req.body.shortdescription,
      description: req.body.description,
      isPremium: req.body.isPremium === "true",
      ispublished: req.body.ispublished === "true",
      topnews: req.body.topnews === "true",
      timetoread: req.body.timetoread,
      allcontent: req.body.allcontent,
      category: parsedCategory,
      categoryId: categoryIds,
      location: parsedLocation,
      locationId: locations,
      tags: tagsArrayParsed,
      allowCopy: finalAllowCopy,
      updatedAt: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
    };

    // Only update images if new files are uploaded
    if (mainImages.length > 0) {
      object.image = mainImages;
    }

    if (middleImagePath) {
      object.middleImage = middleImagePath;
    }

    console.log("Update object:", object);

    const upNews = await newsmoddel.findByIdAndUpdate(
      articleId,
      { $set: object },
      { new: true }
    );

    if (upNews) {
      console.log("=== NEWS UPDATED SUCCESSFULLY ===");
      res.status(200).json({ 
        success: true, 
        message: "News updated successfully",
        data: upNews 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: "News not found or update failed" 
      });
    }
  } catch (err) {
    console.log("Error in updatenews:", err);
    res.status(500).json({ 
      success: false, 
      message: "Something went wrong",
      error: err.message 
    });
  }
};


const updateAllNewsAllowCopy = async (req, res) => {
  try {
    const { allowCopy } = req.body;

    if (!allowCopy || !["both", "subscribed", "unsubscribed", "none"].includes(allowCopy)) {
      return res.status(400).json({
        success: false,
        message: "Valid allowCopy value is required (both, subscribed, unsubscribed, none)"
      });
    }

    const result = await newsmodel.updateMany(
      {},
      { 
        $set: { 
          allowCopy: allowCopy,
          updatedAt: new Date().toISOString(),
          updatedBy: req.user?.id 
        } 
      }
    );

    return res.status(200).json({
      success: true,
      message: `Successfully updated copy permission to "${allowCopy}" for all news articles`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error updating all news allowCopy:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


module.exports.createNews = createNews;
module.exports.addmore = addmore;
module.exports.editnews = editnews;
module.exports.getnews = getnews;
module.exports.deletenews = deletenews;
module.exports.getlatestnews = getlatestnews;
module.exports.getall = getall;

//
module.exports.getAlladminnews = getAlladminnews;
module.exports.deleteadminnews = deleteadminnews;
module.exports.updatenewsstatus = updatenewsstatus;
module.exports.getsinglenewsbyid = getsinglenewsbyid;
// module.exports.addnews = addnews;
module.exports.updatenews = updatenews;
module.exports.updateAllNewsAllowCopy = updateAllNewsAllowCopy;

