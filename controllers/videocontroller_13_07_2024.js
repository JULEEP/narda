const videosmodel = require("../models/videosmodel");
const videomodel = require("../models/videosmodel");
const reporterModel = require("../models/reportermodel");

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
};

const getvideo = async function (req, res) {
  try {
    const id = req.query.id;
    console.log(id);
    let video = await videomodel.findById({ _id: id }).lean();
    let relatedVideos = await videomodel.find();
    let relatedarray = [];
    for (let i = 0; i < relatedVideos.length; i++) {
      let obj = {
        id: relatedVideos[i]._id.toString(),
        video: relatedVideos[i].video,
        title: relatedVideos[i].title,
        description: relatedVideos[i].description,
        bookmark: relatedVideos[i].bookmark,
        time: relatedVideos[i].timetoread,
        thumbnail: relatedVideos[i].image
          ? relatedVideos[i].thumbnail
          : "uploads\\thumbnail.jpg",
        createdAt: formatDateTime(relatedVideos[i].createdAt),
      };

      if (
        relatedVideos[i].video.includes("youtube.com") ||
        relatedVideos[i].video.includes("youtu.be")
      ) {
        obj.youtube = true;
      } else {
        obj.youtube = false;
      }
      relatedarray.push(obj);
    }

    if (
      video.video.includes("youtube.com") ||
      video.video.includes("youtu.be")
    ) {
      video.youtube = true;
    } else {
      video.youtube = false;
    }

    video.thumbnail = video.banner ? video.banner : "uploads\\thumbnail.jpg";
    video.createdAt = formatDateTime(video.createdAt);

    if (video)
      return res
        .status(200)
        .send({ status: true, videos: video, related: relatedarray });
    return res.status(404).send({ message: "Poster not found" });
  } catch (err) {
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
    console.log(usrdata.categories);
    let userLocations = usrdata.locations;
    if (!usrdata)
      return res.status(400).send({ status: false, message: "please Login" });
    let userCategories = usrdata.categories;

    let condition = {};

    if (userCategories && userCategories.length > 0) {
      condition.$or = [
        { category: { $exists: false } },
        { category: { $in: userCategories } },
      ];
    }

    if (userLocations && userLocations.length > 0) {
      condition.$or = condition.$or || [];
      condition.$or.push(
        { location: { $exists: false } },
        { location: { $in: userLocations } }
      );
    }

    let videos = await videomodel.find(condition).sort({ createdAt: -1 });
    if (videos.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "no videos found" });
    let videoarray = [];
    for (let i = 0; i < videos.length; i++) {
      // if(videos[i].video)

      let obj = {
        id: videos[i]._id.toString(),
        video: videos[i].video,
        title: videos[i].title,
        premium: videos[i].isPremium ? videos[i].isPremium : false,
        description: videos[i].description,
        bookmark: videos[i].bookmark,
        time: videos[i].timetoread,
        thumbnail: videos[i].image
          ? videos[i].thumbnail
          : "uploads\\thumbnail.jpg",
      };

      if (
        videos[i].video.includes("youtube.com") ||
        videos[i].video.includes("youtu.be")
      ) {
        obj.youtube = true;
      } else {
        obj.youtube = false;
      }
      videoarray.push(obj);
    }

    return res.status(200).send({ status: true, data: videoarray });
  } catch (err) {
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
    console.log(req.body);
    if (!req.body.video) {
      let files = req.files[0].path;
      req.body.video = files;
    }

    // Fetch reporter
    const reporterschema = await reporterModel.findOne(
      { _id: req.body.reporterId },
      { name: 1 }
    );

    // // Default to empty array if req.body.tag is empty or undefined
    // let tags = [];
    // if (req.body.tags) {
    //   tags = req.body.tags.split(",");
    // }
    // req.body.tags = tags;
    // Add additional fields to the request body
    // req.body.createdBy = req.userId;
    req.body.reporterId = req.body.reporterId;
    req.body.reporter = reporterschema ? reporterschema.name : "";

    let updatedData = await videomodel.findByIdAndUpdate(
      req.params.id,
      req.body,
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
