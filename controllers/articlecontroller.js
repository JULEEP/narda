const articlemodel = require("../models/articlemodel");
const usermodel = require("../models/usermodel");
const stateModel = require("../models/state");
const districtModel = require("../models/district");
const constitModel = require("../models/constituency");
const reporterModel = require("../models/reportermodel");
const categorymodel = require("../models/categorymodel");
const locationmodel = require("../models/locationmodel");
const paymentModel = require("../models/paymentmodel");
const adsmodel = require("../models/adsmodel");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

function timeAgo(timestamp) {
  console.log(timestamp, "{dsfwfw");
  var eventTimestamp = new Date(timestamp).getTime() / 1000;
  var currentTimestamp = Date.now() / 1000;
  var timeDifference = currentTimestamp - eventTimestamp;
  if (timeDifference < 0) {
    return "just now";
  }
  // Calculate time difference in minutes
  var minutesDifference = Math.floor(timeDifference / 60);

  if (minutesDifference < 60) {
    return minutesDifference + " minutes ago";
  } else if (minutesDifference < 60 * 24) {
    var hoursDifference = Math.floor(minutesDifference / 60);
    return hoursDifference + " hours ago";
  } else {
    var daysDifference = Math.floor(minutesDifference / (60 * 24));
    return daysDifference + " days ago";
  }
}

// const createarticle = async function (req, res) {
//   //console.log(req.decoded, "from artcile")
//   try {
//     let stateIds = [];
//     let stateNames = [];
//     let stateCondition = {};
//     if (req.body.stateId !== "All") {
//       stateCondition._id = { $in: req.body.stateId };
//     }
//     stateCondition.isdeleted = "No";
//     const stater = await stateModel.find(stateCondition, { title: 1 });
//     stater.map((val) => {
//       stateIds.push(val._id);
//       stateNames.push(val.title);
//     });
//     let statesObj = stater.map((val) => {
//       return { value: val._id.toString(), label: val.title };
//     });

//     /************** DISTRICTS ******************/
//     let districtIds = [];
//     let districtNames = [];
//     let districtCondition = {};
//     if (req.body.stateId !== "All") {
//       districtCondition.stateId = { $in: req.body.stateId };
//     }
//     if (req.body.districtId !== "All") {
//       districtCondition._id = { $in: req.body.districtId };
//     }
//     districtCondition.isdeleted = "No";
//     // console.log(districtCondition);
//     const distr = await districtModel.find(districtCondition, { title: 1 });
//     distr.map((val) => {
//       districtIds.push(val._id);
//       districtNames.push(val.title);
//     });
//     let districtObj = distr.map((val) => {
//       return { value: val._id.toString(), label: val.title };
//     });

//     /************** CONSTITUENCY ******************/
//     let constitIds = [];
//     let constitNames = [];
//     let constitCondition = {};
//     if (req.body.stateId !== "All") {
//       constitCondition.stateId = { $in: req.body.stateId };
//     }
//     if (req.body.districtId !== "All") {
//       constitCondition.districtId = { $in: req.body.districtId };
//     }
//     if (req.body.constituencyId !== "All") {
//       constitCondition._id = { $in: req.body.constituencyId };
//     }
//     constitCondition.isdeleted = "No";
//     // console.log(constitCondition);
//     const constitr = await constitModel.find(constitCondition, { title: 1 });
//     constitr.map((val) => {
//       constitIds.push(val._id);
//       constitNames.push(val.title);
//     });
//     let constitObj = constitr.map((val) => {
//       return { value: val._id.toString(), label: val.title };
//     });

//     let files = req.files;
//     let picture = files[0].path;
//     let banner = files[1].path;
//     req.body.banner = banner;
//     // req.body.createdBy = req.decoded.email;
//     req.body.createdBy = req.userId;
//     req.body.data = [{ image: picture, content: req.body.description }];
//     // state
//     (req.body.stateId = stateIds),
//       (req.body.stateName = stateNames),
//       (req.body.stateObj = statesObj),
//       // districts
//       (req.body.districtId = districtIds),
//       (req.body.districtName = districtNames),
//       (req.body.districtObj = districtObj),
//       // constituency
//       (req.body.constituencyId = constitIds),
//       (req.body.constituencyName = constitNames),
//       (req.body.constituencyObj = constitObj);

//     // Fetch repoter
//     const reporterschema = await reporterModel.findOne(
//       { _id: req.body.reporterId },
//       { name: 1 }
//     );

//     req.body.reporterId = req.body.reporterId;
//     req.body.reporter = reporterschema ? reporterschema.name : "";

//     let cratearticle = await articlemodel.create(req.body);
//     if (cratearticle)
//       return res
//         .status(200)
//         .json({
//           success: true,
//           message: "Article has been added successfully",
//         });
//   } catch (err) {
//     console.log(err);
//     return res.status(404).send({ message: "Something went wrong" });
//   }
// };

const createarticle = async function (req, res) {
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
      return res.status(400).json({
        success: false,
        message: "Invalid category or location format"
      });
    }

    const categoryIds = parsedCategory.map(cat => new mongoose.Types.ObjectId(cat.value));
    const locations = parsedLocation.map(loc => new mongoose.Types.ObjectId(loc.value));

    // ✅ सही तरीका - File handling
    let mainImages = [];
    let middleImagePath = "";

    console.log("Uploaded files:", req.files);

    // Main images handling
    if (req.files && req.files['image']) {
      mainImages = req.files['image'].map(file => file.path);
    }

    // Middle image handling
    if (req.files && req.files['middleImage'] && req.files['middleImage'][0]) {
      middleImagePath = req.files['middleImage'][0].path;
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
        tagsArrayParsed = typeof tagsArray === 'string' ? [tagsArray] : [];
      }
    }

    // Validate allowCopy field
    const validAllowCopyValues = ["both", "subscribed", "unsubscribed", "none"];
    const finalAllowCopy = validAllowCopyValues.includes(allowCopy) ? allowCopy : "both";

    const cratearticleObj = new articlemodel({
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
      image: mainImages, // ✅ अब images array properly store होगा
      middleImage: middleImagePath,
      timetoread: timetoread,
      category: parsedCategory,
      categoryId: categoryIds,
      location: parsedLocation,
      locationId: locations,
      tags: tagsArrayParsed,
      allowCopy: finalAllowCopy,
      status: "active",
      createdAt: moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A"),
      updatedAt: moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A"),
    });

    const saveArticele = await cratearticleObj.save();
    
    if (saveArticele) {
      return res.status(200).json({
        success: true,
        message: "Article has been added successfully",
        data: saveArticele
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to save article"
      });
    }

  } catch (err) {
    console.log("Error in createarticle:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message
    });
  }
};
/******************************************************************************************************/

const addmore = async function (req, res) {
  try {
    let dataarray;
    if (req.files.length > 0) {
      let files = req.files;
      let picture = files[0].path;
      dataarray = { image: picture, content: req.body.description };
    }

    dataarray = { content: req.body.description };
    let addedarticle = await articlemodel.findByIdAndUpdate(
      { _id: req.body.id },
      { $push: { data: dataarray } },
      { new: true }
    );
    if (addedarticle) return res.status(200).send(addedarticle);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
};

const editarticle = async (req, res) => {
  try {
    //   const files = req.files;

    // console.log(req.file,"req.file++++++++++++++++++++++++");
    //const picture = (files)?files.path:console.log('no file');


    const reporterschema = await reporterModel.findOne(
      { _id: req.body.reporterId },
      { name: 1 }
    );


    const articleId = req.params.id;
    var category = JSON.parse(req.body.category);
    var location = JSON.parse(req.body.location);
    const categoryIds = category.map(cat => new mongoose.Types.ObjectId(cat.value));

    const locations = location.map(loc => new mongoose.Types.ObjectId(loc.value));

    const files = req.files.map(file => file.path);


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
      image: files.length > 0 ? files : console.log('hello'),
      timetoread: req.body.timetoread,
      allcontent: req.body.allcontent,
      category: category,
      categoryId: categoryIds,
      location: location,
      locationId: locations,
      tags: req.body.tagsArray,
      createdAt:moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A"), 
      updatedAt: moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A"),
    };

    const editedArticle = await articlemodel.findByIdAndUpdate(
      articleId,
      { $set: object },
      { new: true }
    );

    if (editedArticle) {
      return res.status(200).json(editedArticle);
    } else {
      return res.status(400).json({ message: "Article not found" });
    }
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
};

const getarticle = async function (req, res) {
  try {
    //console.log(req.params.id)
    const id = req.query.id;
    console.log(id);
    let article = await articlemodel.findById({ _id: id });
    const relatedarticles = await articlemodel.find();
    let relatedarray = [];
    for (let i = 0; i < relatedarticles.length; i++) {
      const obj = {
        id: relatedarticles[i]._id.toString(),
        Image: relatedarticles[i].data[0].image,
        title: relatedarticles[i].title,
        description: relatedarticles[i].data[0].content,
        bookmark: relatedarticles[i].bookmark,
        time: relatedarticles[i].timetoread,
      };
      relatedarray.push(obj);
    }
    if (article)
      return res.status(200).send({ articles: article, related: relatedarray });

    return res.status(400).send({ message: "Article not found" });
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
};

const deleteArticle = async (req, res) => {
  try {
    let id = req.body.id;
    const deleteArticle = await articlemodel.findByIdAndUpdate(
      { _id: id },
      { status: "inactive" },
      { new: true }
    );
    // if (deleteArticle)
    //   return res.status(200).send({ message: "Article deleted" });
    // return res.status(404).send({ message: "Article not found" });

    if (deleteArticle) {
      res.status(200).json({
        success: true,
        message: "Article has been made inactive",
        deleteArticle,
      });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).send({ message: "Something went wrong" });
  }
};


const deleteArticlelist = async (req, res) => {
  try {
    const data = await articlemodel.find(
      { status: "inactive" }
    );

    if (data) {
      res.status(200).json({
        success: true,
        message: "Getting Succesfully",
        data,
      });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).send({ message: "Something went wrong" });
  }
};

const deleteArticleId = async (req, res) => {
  try {
    const data = await articlemodel.deleteOne({ _id: req.body.id });
    if (data) {
      res.status(200).json({
        success: true,
        message: "Deleted Succesfully",
      });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).send({ message: "Something went wrong" });
  }
};


//
const getAlladminarticles = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition = {
        $or: [{ title: regex }],
      };
    }

    console.log(condition);
    const articles = await articlemodel.find(condition).sort({
      createdAt: -1,
    });
    if (articles) {
      res.status(200).json({
        success: true,
        message: "Article's have been retrived successfully ",
        articles: articles,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

// const getall = async function (req, res) {
//   console.log("hiii");
//   try {
//     let allarticles = await articlemodel.find();
//     const dataArray = [];

//     for (let i = 0; i < allarticles.length; i++) {
//       console.log(allarticles[i]);

//       const obj = {
//         id: allarticles[i]._id.toString(),
//         Image: allarticles[i].data[0].image,
//         title: allarticles[i].title,
//         description: allarticles[i].data[0].content,
//         bookmark: allarticles[i].bookmark,
//         time: allarticles[i].timetoread,
//       };
//       console.log(obj);
//       dataArray.push(obj);
//     }
//     //console.log(dataArray)
//     if (allarticles.length)
//       return res.status(200).send({ status: true, data: dataArray });
//   } catch (error) {
//     return res.status(400).send({ status: false, message: error.message });
//   }
// };

const getall = async function (req, res) {
  console.log("hitting getall");
  try {

    
    const id=req.decoded.id;
    
    const userpaid = await paymentModel.findOne({ customerId: id }).sort({ _id: -1 }).limit(1);

    let isPremium = false;
    if (userpaid && userpaid.status === "completed") {
      isPremium = true;
    }

    let searchQuery = req.query.searchQuery;
    let regex = new RegExp(searchQuery, "i");

   let allarticles = await articlemodel.find({
    isPremium: isPremium,
    $or: [{ title: regex }, { description : regex }],
  }).sort({ timestamp : -1 });
   
    const dataArray = [];
 
    for (let i = 0; i < allarticles.length; i++) {
      
      if (allarticles[i].data && allarticles[i].data.length > 0) {
        const obj = {
          id: allarticles[i]._id.toString(),
          Image: allarticles[i].data[0].image,
          title: allarticles[i].title,
          description: allarticles[i].data[0].content,
          bookmark: allarticles[i].bookmark,
          time: allarticles[i].timetoread,
        };
        
        dataArray.push(obj);
      }
    }
    
    if (allarticles.length){
      
      return res.status(200).send({ status: true, data: dataArray });
    }
   
  } catch (error) {
    return res.status(400).send({ status: false, message: error.message});
  }
};



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

  return `${formattedDay} of ${month} ${year}, ${formattedHours}:${formattedMinutes} ${ampm}`;
}

const getlatestarticle = async function (req, res) {
  try {
    console.log(req.decoded.id);
    const userId = req.decoded.id;

    const usrdata = await usermodel.findById({ _id: req.decoded.id });
    if (!usrdata)
      return res.status(400).send({ status: false, message: "please Login" });

    let userCategories = usrdata.categories;
    let userLocations = usrdata.locations;
    let condition = {};
    condition.status = "active";

    if (userCategories && userCategories.length > 0) {
      const categoryIds = userCategories.map(cate => new mongoose.Types.ObjectId(cate));
      condition.$or = condition.$or || [];
      condition.$or.push({ categoryId: { $in: categoryIds } });
    }

    if (userLocations && userLocations.length > 0) {
      const locations = userLocations.map(loc => new mongoose.Types.ObjectId(loc));
      condition.$or = condition.$or || [];
      condition.$or.push({ locationId: { $in: locations } });
    }

    console.log(condition, "conditionloca");

    let allarticles = await articlemodel
      .find(condition)
      .sort({ createdAt: -1 });

    let topartciles = await articlemodel
      .find({ topnews: true, status: "active" })
      .sort({ createdAt: -1 });

    console.log(topartciles, "allarticles+++++++++++++++++++++++++++++");
    const latestarray = [];
    let topnews = [];
    let adds = await adsmodel.find({ type: "articles" }).sort({ createdAt: -1 });
    let j = 0;

    // ✅ Helper: Check if user can copy
    const canUserCopy = (articleAllowCopy, user) => {
      const now = new Date();

      switch (articleAllowCopy) {
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

    for (let i = 0; i < allarticles.length; i++) {
      const obj = {
        id: allarticles[i]._id.toString(),
        Image: allarticles[i].image?.[0] || "",
        middleImage: allarticles[i].middleImage || "", // ✅ Added middleImage field
        title: allarticles[i].title,
        description: allarticles[i].allcontent,
        shortdescription: allarticles[i].shortdescription,
        bookmark: allarticles[i].bookmark,
        time: allarticles[i].timetoread,
        premium: allarticles[i].isPremium,
        allowCopy: canUserCopy(allarticles[i].allowCopy, usrdata),
        createdAt: allarticles[i].createdAt,
        type: "articles",
        url: '',
        sort: i
      };

      latestarray.push(obj);

      // Insert ads every 3 articles
      if (i % 3 == 0) {
        if (j < adds.length && adds.length > 0) {
          const addobj = {
            id: adds[j]._id.toString(),
            Image: adds[j].image,
            middleImage: "", // ✅ No middleImage for ads
            title: adds[j].title,
            description: adds[j].description,
            bookmark: '',
            time: '',
            premium: false,
            allowCopy: false,
            createdAt: formatDateTime(adds[j].createdAt),
            type: "add",
            url: adds[j].url,
            sort: i
          };
          latestarray.push(addobj);
          j = j + 1;
        }
      }
    }

    latestarray.sort((a, b) => a.sort - b.sort);

    // ✅ Top news with middleImage added
    for (let i = 0; i < topartciles.length; i++) {
      const obj = {
        id: topartciles[i]._id.toString(),
        Image: topartciles[i].image?.[0] || "",
        middleImage: topartciles[i].middleImage || "", // ✅ Added middleImage here too
        title: topartciles[i].title,
        description: topartciles[i].allcontent,
        shortdescription: topartciles[i].shortdescription,
        bookmark: topartciles[i].bookmark,
        time: topartciles[i].timetoread,
        premium: topartciles[i].isPremium,
        allowCopy: canUserCopy(topartciles[i].allowCopy, usrdata),
        createdAt: topartciles[i].createdAt,
      };
      topnews.push(obj);
    }

    console.log(topnews, "topnews");
    console.log(latestarray, "latestnews");

    return res
      .status(200)
      .send({ status: true, latestnews: latestarray, topnews: topnews });

  } catch (err) {
    console.error(err);
    return res.status(404).send({ status: false, message: err.message });
  }
};


//GET BYID FOR ADMIN
const getadminarticlebyid = async function (req, res) {
  try {
    console.log("hello");
    const artcile = await articlemodel.find({ _id: new mongoose.Types.ObjectId(req.body.id) });

    if (artcile) {
      res.status(200).json({
        success: true,
        message: "Artcile details has been retrived sucessfully",
        artcile,
      });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

/////////////////////////////////////////////////////////////////// new
const updateadminArticle = async function (req, res) {
  try {
    const articleId = req.params.id; // Get the article ID from the URL parameters

    const reporterschema = await reporterModel.findOne(
      { _id: req.body.reporterId },
      { name: 1 }
    );
    console.log("hello", req.body.category);

    const cratearticleObj = {
      reporterId: req.body.reporterId,
      reporter: reporterschema ? reporterschema.name : "",
      title: req.body.title,
      updatedBy: req.userId,
      shortdescription: req.body.shortdescription,
      description: req.body.description,
      isPremium: req.body.isPremium,
      ispublished: req.body.ispublished,
      topnews: req.body.topnews,
      image: req.file ? req.file.path : "",
      timetoread: req.body.timetoread,
      allcontent: req.body.allcontent,
      category: JSON.parse(req.body.category),
      location: JSON.parse(req.body.location),
      tags: req.body.tagsArray
    };

    let updatedArticle = await articlemodel.findByIdAndUpdate(
      articleId,
      cratearticleObj,
      { new: true }
    );
    if (updatedArticle) return res.status(200).send(updatedArticle);

  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

/////////////
const updatearticlestatus = async function (req, res) {
  try {
    const logDate = new Date().toISOString();
    const poster = await articlemodel.findByIdAndUpdate(
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


// Update allowCopy for all articles
// Update allowCopy for all articles - NEW ROUTE
const updateAllArticlesAllowCopy = async (req, res) => {
  try {
    const { allowCopy } = req.body;

    if (!allowCopy || !["both", "subscribed", "unsubscribed", "none"].includes(allowCopy)) {
      return res.status(400).json({
        success: false,
        message: "Valid allowCopy value is required (both, subscribed, unsubscribed, none)"
      });
    }

    const result = await articlemodel.updateMany(
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
      message: `Successfully updated copy permission to "${allowCopy}" for all articles`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error updating all articles allowCopy:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


module.exports.createarticle = createarticle;
module.exports.addmore = addmore;
module.exports.editarticle = editarticle;
module.exports.getarticle = getarticle;
module.exports.deleteArticle = deleteArticle;
module.exports.deleteArticlelist = deleteArticlelist;
module.exports.getall = getall;
module.exports.getlatestarticle = getlatestarticle;
//
module.exports.getadminarticlebyid = getadminarticlebyid;
module.exports.getAlladminarticles = getAlladminarticles;
module.exports.updateadminArticle = updateadminArticle;
module.exports.updatearticlestatus = updatearticlestatus;
module.exports.deleteArticleId = deleteArticleId;
module.exports.updateAllArticlesAllowCopy = updateAllArticlesAllowCopy;

