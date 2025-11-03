const articlemodel = require("../models/articlemodel");
const usermodel = require("../models/usermodel");
const stateModel = require("../models/state");
const districtModel = require("../models/district");
const constitModel = require("../models/constituency");
const reporterModel = require("../models/reportermodel");
const categorymodel = require("../models/categorymodel");
const locationmodel = require("../models/locationmodel");
const mongoose = require("mongoose");

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
  //console.log(req.decoded, "from artcile")
  try {
    console.log(req.body);
    console.log(JSON.parse(req.body.category));
    console.log(JSON.parse(req.body.location));
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

    /************** DISTRICTS ******************/
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

    /************** CONSTITUENCY ******************/
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

    // let files = req.files;
    // let picture = files[0].path;
    // let banner = files[1].path;
    // req.body.banner = banner;
    // // req.body.createdBy = req.decoded.email;
    // // req.body.createdBy = req.userId;
    // req.body.data = [{ image: picture, content: req.body.description }];
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

    // Fetch repoter
    const reporterschema = await reporterModel.findOne(
      { _id: req.body.reporterId },
      { name: 1 }
    );

    // Fetch repoter
    // const categoryschema = await categorymodel.find(
    //   { _id: req.body.category },
    //   { name: 1 }
    // );

    // // Fetch repoter
    // const locationschema = await locationmodel.find(
    //   { _id: req.body.location },
    //   { name: 1 }
    // );

    // req.body.reporterId = req.body.reporterId;
    // req.body.reporter = reporterschema ? reporterschema.name : "";

    // let cratearticle = await articlemodel.create(req.body);

    // const categoryArray = JSON.parse(req.body.category);
    // const locationArray = JSON.parse(req.body.location);
    // const tagsArray = JSON.parse(req.body.tags);

    // // Ensure categoryArray contains valid ObjectIds
    // const validCategoryArray = categoryArray.map(
    //   (id) => new mongoose.Types.ObjectId(id)
    // );

    // // Ensure categoryArray contains valid ObjectIds
    // const validlocationArray = locationArray.map(
    //   (id) => new mongoose.Types.ObjectId(id)
    // );

    const cratearticleObj = new articlemodel({
      reporterId: req.body.reporterId,
      reporter: reporterschema ? reporterschema.name : "",
      title: req.body.title,
      createdBy: req.userId,
      description: req.body.description,
      // category: req.body.category,
      // category: JSON.parse(req.body.category),
      // category: validCategoryArray,
      // location: validlocationArray,
      //categoryName: categoryschema ? categoryschema.name : "",
      isPremium: req.body.isPremium,
      ispublished: req.body.ispublished,
      topnews: req.body.topnews,
      //tags: JSON.parse(req.body.tags),
      image: req.file ? req.file.path : "",
      timetoread: req.body.timetoread,
      allcontent: req.body.allcontent,
      category: JSON.parse(req.body.category),
      location: JSON.parse(req.body.location),
      //location: req.body.location,
      tags: tagsArray,
      // locationName: locationschema ? locationschema.name : "",
    });
    const saveArticele = await cratearticleObj.save();
    if (saveArticele)
      return res.status(200).json({
        success: true,
        message: "Article has been added successfully",
      });
  } catch (err) {
    console.log(err);
    return res.status(404).send({ message: "Something went wrong" });
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
    const files = req.files;
    const picture = files[0].path;
    const id = req.body.id;
    const outer = 2;
    const inner = 0;
    const description = req.body.description;
    const newData = { image: picture, content: description };
    const editedArticle = await articlemodel.findByIdAndUpdate(
      id,
      { $set: { [`data[${outer}][${inner}][content]`]: "duqwdgqugdq" } },
      { new: true }
    );

    if (editedArticle) {
      return res.status(200).json(editedArticle);
    } else {
      return res.status(404).json({ message: "Article not found" });
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

const getall = async function (req, res) {
  console.log("hiii");
  try {
    let allarticles = await articlemodel.find();
    const dataArray = [];

    for (let i = 0; i < allarticles.length; i++) {
      console.log(allarticles[i]);

      const obj = {
        id: allarticles[i]._id.toString(),
        Image: allarticles[i].data[0].image,
        title: allarticles[i].title,
        description: allarticles[i].data[0].content,
        bookmark: allarticles[i].bookmark,
        time: allarticles[i].timetoread,
      };
      console.log(obj);
      dataArray.push(obj);
    }
    //console.log(dataArray)
    if (allarticles.length)
      return res.status(200).send({ status: true, data: dataArray });
  } catch (error) {
    return res.status(400).send({ status: false, message: error.message });
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
    if (userCategories && userCategories.length > 0) {
      condition.$or = [
        { category: { $exists: false } },
        { category: { $in: userCategories } },
      ];
    }

    console.log(userCategories, "usrrr");

    if (userLocations && userLocations.length > 0) {
      condition.$or = condition.$or || [];
      condition.$or.push(
        { location: { $exists: false } },
        { location: { $in: userLocations } }
      );
    }

    let allarticles = await articlemodel
      .find(condition)
      .sort({ createdAt: -1 });
    let topartciles = await articlemodel.find({ topnews: true });
    const latestarray = [];
    let topnews = [];
    for (let i = 0; i < allarticles.length; i++) {
      console.log(allarticles[i].data[0].image);

      const formattedDate = timeAgo(allarticles[i].createdAt);
      console.log(formattedDate);

      const obj = {
        id: allarticles[i]._id.toString(),
        Image: allarticles[i].data[0].image,
        title: allarticles[i].title,
        description: allarticles[i].data[0].content,
        bookmark: allarticles[i].bookmark,
        time: allarticles[i].timetoread,
        premium: allarticles[i].isPremium,
        createdAt: formatDateTime(allarticles[i].createdAt),
      };

      latestarray.push(obj);
    }

    for (let i = 0; i < topartciles.length; i++) {
      const obj = {
        id: topartciles[i]._id.toString(),
        Image: topartciles[i].data[0].image,
        title: topartciles[i].title,
        description: topartciles[i].data[0].content,
        bookmark: topartciles[i].bookmark,
        time: topartciles[i].timetoread,
        premium: topartciles[i].isPremium,
        createdAt: formatDateTime(topartciles[i].createdAt),
      };

      topnews.push(obj);
    }

    if (latestarray.length > 0)
      return res
        .status(200)
        .send({ status: true, latestnews: latestarray, topnews: topnews });
    return res.status(404).send({ status: false, message: "not found" });
  } catch (err) {
    return res.status(404).send({ status: false, message: err.message });
  }
};

//GET BYID FOR ADMIN
const getadminarticlebyid = async function (req, res) {
  try {
    const artcile = await articlemodel.find({ _id: req.body.id });

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

    /************** DISTRICTS ******************/
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
    const distr = await districtModel.find(districtCondition, { title: 1 });
    distr.map((val) => {
      districtIds.push(val._id);
      districtNames.push(val.title);
    });
    let districtObj = distr.map((val) => {
      return { value: val._id.toString(), label: val.title };
    });

    /************** CONSTITUENCY ******************/
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
    const constitr = await constitModel.find(constitCondition, { title: 1 });
    constitr.map((val) => {
      constitIds.push(val._id);
      constitNames.push(val.title);
    });
    let constitObj = constitr.map((val) => {
      return { value: val._id.toString(), label: val.title };
    });

    let files = req.files;
    let picture = files && files.length > 0 ? files[0].path : req.body.picture;
    let banner = files && files.length > 1 ? files[1].path : req.body.banner;
    req.body.banner = banner;
    req.body.createdBy = req.userId;
    req.body.data = [{ image: picture, content: req.body.description }];
    req.body.stateId = stateIds;
    req.body.stateName = stateNames;
    req.body.stateObj = statesObj;
    req.body.districtId = districtIds;
    req.body.districtName = districtNames;
    req.body.districtObj = districtObj;
    req.body.constituencyId = constitIds;
    req.body.constituencyName = constitNames;
    req.body.constituencyObj = constitObj;

    // Fetch repoter
    const reporterschema = await reporterModel.findOne(
      { _id: req.body.reporterId },
      { name: 1 }
    );

    req.body.reporterId = req.body.reporterId;
    req.body.reporter = reporterschema ? reporterschema.name : "";

    let updatedArticle = await articlemodel.findByIdAndUpdate(
      articleId,
      req.body,
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
module.exports.createarticle = createarticle;
module.exports.addmore = addmore;
module.exports.editarticle = editarticle;
module.exports.getarticle = getarticle;
module.exports.deleteArticle = deleteArticle;
module.exports.getall = getall;
module.exports.getlatestarticle = getlatestarticle;
//
module.exports.getadminarticlebyid = getadminarticlebyid;
module.exports.getAlladminarticles = getAlladminarticles;
module.exports.updateadminArticle = updateadminArticle;
module.exports.updatearticlestatus = updatearticlestatus;
