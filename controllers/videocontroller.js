const videosmodel = require("../models/videosmodel");
const videomodel = require("../models/videosmodel");
const reporterModel = require("../models/reportermodel");
const adminModel = require("../models/usermodel");
const mongoose = require("mongoose");
const striptags = require('striptags');
const adsmodel = require("../models/adsmodel");
const moment = require("moment-timezone");
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

/*
const createvideo = async function (req, res) {
  try {

    console.log(req.body);
    const randomNumber = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    if (!req.body.video) {
      let files = req.files[0].path;
      req.body.video = files;
    }

    // req.body.createdBy = req.decoded.email;
    req.body.createdBy = req.userId;
    req.body.videoId = "narvid" + randomNumber;

    let crateddata = await videomodel.create(req.body);
    if (crateddata) return res.status(200).send(crateddata);



  } catch (err) {
    return res.status(404).send({ message: err.message });
  }
};*/

const createvideo = async function (req, res) {
  try {
    
    var {title,description,category,reporterId,videourl,isPremium,timetoread,location,tagsArray,youtube} =req.body;
    const randomNumber = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

      const reporterschema = await reporterModel.findOne(
        { _id: req.body.reporterId },
        { name: 1 }
      );

      category=JSON.parse(req.body.category);
      location=JSON.parse(req.body.location);

      const categoryIds = category.map(cat => new mongoose.Types.ObjectId(cat.value));
      const locations = location.map(loc => new mongoose.Types.ObjectId(loc.value));
        

      const image = req.files['image'] ? req.files['image'][0].path : null;
      const video = req.files['video'] ? req.files['video'][0].path : null;

      console.log(video,"video");
      console.log(image,"image");


      let object ={};
      object.title=title;
      object.description=description;
      object.banner=image;
      object.video=videourl?videourl:video;
      object.reporter=reporterschema ? reporterschema.name : "";
      object.reporterId=reporterId;
      object.category=category;
      object.categoryId=categoryIds;
      object.locationId=locations;
      //object.language=JSON.parse(language);
      object.location=location;
      object.isPaid=isPremium;
      object.isPremium=isPremium;
      object.status="Active";
      object.tags=tagsArray;
      object.videoId=randomNumber;
      object.timetoread=timetoread;
      object.youtube=youtube;
      object.createdAt= moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
      object.updatedAt= moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
      object.createdBy=req.userId;
      let crateddata = await videomodel.create(object);
    if (crateddata) return res.status(200).send(crateddata);

  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: err.message });
  }


}


const getvideo = async function (req, res) {
  try {
    const id = req.query.id;
    console.log(id);
    let video = await videomodel.findById({ _id: id }).lean();
    
    let relatedVideos = await videomodel.find({categoryId:video.categoryId});
    let relatedarray = [];
    for (let i = 0; i < relatedVideos.length; i++) {
      let obj = {
        id: relatedVideos[i]._id.toString(),
        video: relatedVideos[i].video,
        title: relatedVideos[i].title,
        shortdescription: striptags(relatedVideos[i].description),
        bookmark: relatedVideos[i].bookmark,
        time: relatedVideos[i].timetoread,
        thumbnail: relatedVideos[i].banner
          ? relatedVideos[i].banner
          : "uploads\\thumbnail.jpg",
        createdAt: relatedVideos[i].createdAt,
        youtube : relatedVideos[i].youtube
      };
     
      relatedarray.push(obj);
    }

    let category =video.category;
    const categoryValues = category.map(cat => cat.label);

// Convert the array of values to a string
     const categoryString = categoryValues.join(',');


    video.categoryName=categoryString;
    video.createdAt= video.createdAt;

    // console.log(video.createdBy,"video.createdBy");
    // var creartedUser=await adminModel.findOne({_id:video.createdBy});

    // video.createdByUser = creartedUser.name || "";

    if (video)
    console.log(video,"video");
      return res
        .status(200)
        .send({ status: true, videos: video, related: relatedarray });
    return res.status(404).send({ message: "Poster not found" });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: err.message });
  }
};

const deletevideo = async function (req, res) {
  try {
    let id = req.body.id;
    const deletePoster = await videomodel.deleteOne({ _id: id });
    if (deletePoster)
      return res.status(204).send({ message: "Poster deleted" });
    return res.status(404).send({ message: "poster not found" });
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

const usermodel = require("../models/usermodel");


const getallvideos = async function (req, res) {
  try {
    console.log(req.decoded.id);
    const userId = req.decoded.id;

    const usrdata = await usermodel.findById({ _id: req.decoded.id });
    console.log(usrdata.categories,"usrdata.categories");
    console.log(usrdata.locations,"usrdata.locations");
    let userLocations = usrdata.locations;
    if (!usrdata)
      return res.status(400).send({ status: false, message: "please Login" });
    let userCategories = usrdata.categories;

    let condition = {};
    condition.status='Active';

if (userCategories && userCategories.length > 0) {
  const categoryIds = userCategories.map(cate => new mongoose.Types.ObjectId(cate));
  if (!condition.$or) {
    condition.$or = [];
  }
  condition.$or.push({ categoryId: { $in: categoryIds } });
}

if (userLocations && userLocations.length > 0) {
  if (!condition.$or) {
    condition.$or = [];
  }
  const locations = userLocations.map(loc => new mongoose.Types.ObjectId(loc));

  condition.$or.push({ locationId: { $in: locations } });
}

console.log("condition", "condition");

let videos = await videomodel.find(condition).sort({ createdAt: -1 });

    // if (videos.length == 0)
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "NOt found",data:[] });

    let adds = await adsmodel.find({type:"videos"}).sort({createdAt: -1});
    let j=0;

    console.log(adds.length,"adds.length");

    let videoarray = [];
    for (let i = 0; i < videos.length; i++) {
      // if(videos[i].video)

      let obj = {
        id: videos[i]._id.toString(),
        video: videos[i].video,
        title: videos[i].title,
        premium: videos[i].isPremium ? videos[i].isPremium : false,
        description: videos[i].description,
        shortdescription: striptags(videos[i].description),
        bookmark: videos[i].bookmark,
        time: videos[i].timetoread,
        youtube:videos[i].youtube,
        thumbnail: videos[i].banner? videos[i].banner: "uploads\\thumbnail.jpg",
        type:"videos",
        url:'',
        sort:i
      };
      videoarray.push(obj);
      if(i%3 == 0)
        {
          if(j<adds.length && adds.length>0)
          {       
            const addobj = {
              id: adds[j]._id.toString(),
              video: "",
              thumbnail: adds[j].image,
              title: adds[j].title,
              description: adds[j].description,
              shortdescription: adds[j].description,
              youtube:'',
              bookmark: '',
              time: '',
              premium: false,
              createdAt: formatDateTime(adds[j].createdAt),
              type:"add",
              url:adds[j].url,
              sort:i
            };
            videoarray.push(addobj);
            j=j+1;
          }
        }
    }

    videoarray.sort((a, b) => a.sort - b.sort);
    
    return res.status(200).send({ status: true, data: videoarray });
  } catch (err) {

    console.log(err);
    return res.status(500).send({ status: false, message: err.message });
  }
};

const getlatestVideos = async function (req, res) {
  try {
    let videos = await videomodel.find().sort({ createdAt: -1 });
    let latestarray = [];
    let topvidoes = await videosmodel.find({ topnews: true });
    let toparray = [];

    for (let i = 0; i < videos.length; i++) {
      let obj = {
        id: videos[i]._id.toString(),
        video: videos[i].video,
        title: videos[i].title,
        premium: videos[i].isPremium ? videos[i].isPremium : false,
        description: videos[i].description,
        bookmark: videos[i].bookmark,
        time: videos[i].timetoread,
      };
      latestarray.push(obj);
    }

    for (let i = 0; i < topvidoes.length; i++) {
      let obj = {
        id: topvidoes[i]._id.toString(),
        video: topvidoes[i].video,
        title: topvidoes[i].title,
        premium: videos[i].isPremium ? videos[i].isPremium : false,
        description: topvidoes[i].description,
        bookmark: topvidoes[i].bookmark,
        time: topvidoes[i].timetoread,
      };
      toparray.push(obj);
    }
    return res
      .status(200)
      .send({ status: true, latest: latestarray, top: toparray });
  } catch (err) {
    return res.status(404).send({ status: false, message: err.message });
  }
};

const getalllikes = async function (req, res) {
  try {
    let poster = await videomodel.find({ createdBy: req.decoded.email });
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

/////////////////////////////////////////////////////////////////////////////////////////
const getvideobyid = async function (req, res) {
  try {
    const video = await videomodel.find({ _id: req.body.id });

    if (video) {
      res.status(200).json({
        success: true,
        message: "Video details has been retrived sucessfully",
        video,
      });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//
const deleteadminvideo = async function (req, res) {

  console.log(req.params.id, "req.params.id");
  try {
    const video = await videomodel.findByIdAndDelete({
      _id: req.params.id,
    });
    if (video) {
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
const updatevideostatus = async function (req, res) {
  try {
    const logDate = new Date().toISOString();
    const poster = await videomodel.findByIdAndUpdate(
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

//
const getAlladminvideos = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition = {
        $or: [{ title: regex }],
      };
    }

    console.log(condition);
    const videos = await videomodel.find(condition).sort({
      createdAt: -1,
    });
    if (videos) {
      res.status(200).json({
        success: true,
        message: "Video's have been retrived successfully ",
        videos: videos,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

//
const updateVideo = async function (req, res) {
  try {

    var { title,description,category,reporterId,videourl,isPremium,timetoread,location,tagsArray,youtube } =req.body;

      const reporterschema = await reporterModel.findOne(
        { _id: reporterId },
        { name: 1 }
      );

      let videodata = await videomodel.findOne({ _id: req.params.id }).lean();

      console.log(videodata,"videodata");

      category=JSON.parse(req.body.category);
      location=JSON.parse(req.body.location);

      const categoryIds = category.map(cat => new mongoose.Types.ObjectId(cat.value));
      const locations = location.map(loc => new mongoose.Types.ObjectId(loc.value));

      const image = req.files['image'] ? req.files['image'][0].path : videodata.banner;
      
      const video = req.files['video'] ? req.files['video'][0].path : '';

      console.log(req.files['video'],"video-----------");

      let object ={};
      object.title=title;
      object.description=description;
      object.banner=image;
     
      object.reporter=reporterschema ? reporterschema.name : "";
      object.reporterId=reporterId;
      object.category=category;
      object.categoryId=categoryIds;
      object.locationId=locations;
      //object.language=JSON.parse(language);
      object.location=location;
      object.isPaid=isPremium;
      object.tags=tagsArray;
      object.timetoread=timetoread;
      object.youtube=youtube;


      if(req.files['video'])
      {
        object.video= req.files['video'][0].path;
      }
      else if(videourl!="")
      {
        object.video= videourl;
      }
    let updatedData = await videomodel.findByIdAndUpdate(
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
    return res.status(400).send({ message: "Something went wrong" });
  }
};
//
module.exports.getvideobyid = getvideobyid;
module.exports.updatevideostatus = updatevideostatus;
module.exports.deleteadminvideo = deleteadminvideo;
module.exports.getAlladminvideos = getAlladminvideos;
module.exports.updateVideo = updateVideo;
//
module.exports.createvideo = createvideo;
module.exports.getvideo = getvideo;
module.exports.deletevideo = deletevideo;
module.exports.getallvideos = getallvideos;
module.exports.getlatestVideos = getlatestVideos;
module.exports.getalllikes = getalllikes;
