const slidermodel = require("../models/slidermodel");
const reporterModel = require("../models/reportermodel");

// const createsliders = async function (req, res) {
//   try {
//     let files = req.files;
//     console.log(files, "filess");
//     const randomNumber = Math.floor(Math.random() * 1000)
//       .toString()
//       .padStart(3, "0");
//     let slider = Array(files.length);
//     for (let i = 0; i < files.length; i++) {
//       slider[i] = files[i].path;
//     }
//     req.body.sliders = slider;
//     req.body.createdBy = req.decoded.email;
//     req.body.sliderId = "naraslid" + randomNumber;

//     console.log(req.body);
//     let createslider = await slidermodel.create(req.body);
//     if (createslider)
//       return res.status(200).send({ status: true, message: createslider });
//     return res
//       .status(400)
//       .send({ status: false, message: "Error creating slider" });
//   } catch (err) {
//     console.log(err);
//     return res
//       .status(500)
//       .send({ status: false, message: "Something went wrong" });
//   }
// };
const createsliders = async function (req, res) {
  try {
    const logDate = new Date().toISOString();

    // Fetch category
    const reporterschema = await reporterModel.findOne(
      { _id: req.body.reporterId },
      { name: 1 }
    );

    const randomNumber = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    // image for multiple purposes
    let imageArray = [];
    const uploadFiles = req.files && req.files.sliders ? req.files.sliders : [];
    uploadFiles.map((item) => {
      imageArray.push(item.path);
    });

    req.body.sliderId = "naraslid" + randomNumber;

    // Default to empty array if req.body.tag is empty or undefined
    let tags = [];
    if (req.body.tags) {
      tags = req.body.tags.split(",");
    }

    const testimoniObj = new slidermodel({
      sliderId: req.body.sliderId,
      //   sliders: req.body.sliders,
      sliders: uploadFiles.length > 0 ? imageArray : console.log("No Sliders"),
      title: req.body.title,
      createdBy: req.userId,
      size: req.body.size,
      reporterId: req.body.reporterId,
      reporter: reporterschema ? reporterschema.name : "",
      visible: req.body.visible,
      status: req.body.status,
      tags: tags,
      // tags: JSON.parse(req.body.tags),
      //tags: req.body.tag.split(","),
      //tags: req.body.tag ? req.body.tag.split(","),
      expirydate: req.body.expirydate,
    });

    const saveSlider = await testimoniObj.save();
    if (saveSlider) {
      res
        .status(200)
        .json({ success: true, message: "Slider created successfully" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ status: false, message: "Something went wrong" });
  }
};

// get all products
const getAlladminsliders = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition = {
        $or: [{ title: regex }],
      };
    }

    console.log(condition);
    const sliders = await slidermodel.find(condition).sort({
      createdAt: -1,
    });
    if (sliders) {
      res.status(200).json({
        success: true,
        message: "Slider's have been retrived successfully ",
        sliders: sliders,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

// get  byid
const getsliderbyid = async function (req, res) {
  try {
    const slider = await slidermodel.find({ _id: req.body.id });

    if (slider) {
      res.status(200).json({
        success: true,
        message: "Slider details has been retrived sucessfully",
        slider,
      });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

const editadminslider = async function (req, res) {
  try {
    const logDate = new Date().toISOString();

    // Fetch category
    const reporterschema = await reporterModel.findOne(
      { _id: req.body.reporterId },
      { name: 1 }
    );

    // image for multiple purposes
    let imageArray = [];
    const uploadFiles = req.files && req.files.sliders ? req.files.sliders : [];
    uploadFiles.map((item) => {
      imageArray.push(item.path);
    });

    // Default to empty array if req.body.tag is empty or undefined
    let tags = [];
    if (req.body.tags) {
      tags = req.body.tags.split(",");
    }

    console.log("req.body------------------------------:", req.body);
    const slider = await slidermodel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          sliders:
            uploadFiles.length > 0 ? imageArray : console.log("No Sliders"),
          title: req.body.title,
          size: req.body.size,
          reporterId: req.body.reporterId,
          reporter: reporterschema ? reporterschema.name : "",
          visible: req.body.visible,
          status: req.body.status,
          // tags: JSON.parse(req.body.tags),
          tags: tags,
          expirydate: req.body.expirydate,
          updatedAt: logDate,
        },
      },
      { new: true }
    );

    if (slider) {
      res.status(200).json({
        success: true,
        message: "Upated successfullly",
      });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// const editadminslider = async function (req, res) {
//   try {
//     const logDate = new Date().toISOString();

//     // Fetch category
//     const reporterschema = await reporterModel.findOne(
//       { _id: req.body.reporterId },
//       { name: 1 }
//     );

//     // Handle image uploads
//     let imageArray = [];
//     const uploadFiles = req.files && req.files.sliders ? req.files.sliders : [];
//     uploadFiles.forEach((item) => {
//       imageArray.push(item.path);
//     });

//     console.log("Request Body---------------------:", req.body);

//     const updateFields = {
//       title: req.body.title,
//       //   createdBy: req.userId,
//       size: req.body.size,
//       reporterId: req.body.reporterId,
//       reporter: reporterschema ? reporterschema.name : "",
//       visible: req.body.visible,
//       status: req.body.status,
//       //tags: JSON.parse(req.body.tags), // Assuming tags is a JSON string
//       expirydate: req.body.expirydate,
//       updatedAt: logDate,
//     };

//     if (uploadFiles.length > 0) {
//       updateFields.sliders = imageArray;
//     }
//     // Check if tags is a valid JSON string
//     if (req.body.tags) {
//       try {
//         updateFields.tags = JSON.parse(req.body.tags);
//       } catch (err) {
//         return res
//           .status(400)
//           .json({ success: false, message: "Invalid tags format" });
//       }
//     }
//     console.log("Update fields-----------------------------: ", updateFields); // Log the update fields
//     console.log("Document ID----------------------------: ", req.params.id); // Log the document ID

//     const state = await slidermodel.updateOne(
//       { _id: req.params.id },
//       { $set: updateFields },
//       { new: true }
//     );

//     if (state.nModified > 0) {
//       res.status(200).json({
//         success: true,
//         message: "Updated successfully",
//       });
//     } else {
//       res.status(400).json({
//         success: false,
//         message: "No changes detected or invalid ID",
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ success: false, message: "Something went wrong" });
//   }
// };

const deleteslider = async function (req, res) {
  try {
    const plan = await slidermodel.findByIdAndDelete({
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
const getslider = async function (req, res) {
  try {
    let sliderid = req.query.id;
    let slider = await slidermodel.findById({ _id: sliderid });
    if (slider) {
      return res.status(200).send({ message: slider });
    }
    return res.status(404).send({ status: false, message: "Slider not found" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const getallsliders = async function (req, res) {
  try {
    let slider = await slidermodel.find({status: "active"});
    if (slider) {
      return res.status(200).send({ message: slider });
    }
    return res.status(404).send({ status: false, message: "Slider not found" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
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

const updateExpiredSliders = async () => {
  const expiryDate = new Date();
  expiryDate.setHours(0, 0, 0, 0); // Set the time to midnight
  const expiredSliders = await slidermodel.updateMany(
    {
      $expr: {
        $lte: [
          { $dateFromString: { dateString: "$expirydate", format: "%Y-%m-%d" } },
          expiryDate
        ]
      }
    },
    { $set: { status: "inactive" } }
  );
};

// Run the function daily at midnight
const schedule = require('node-schedule');
schedule.scheduleJob('*/10 * * * * *', updateExpiredSliders);


module.exports.createsliders = createsliders;
module.exports.getslider = getslider;
module.exports.getallsliders = getallsliders;
module.exports.getalllikes = getalllikes;
module.exports.deleteslider = deleteslider;

module.exports.getAlladminsliders = getAlladminsliders;
module.exports.editadminslider = editadminslider;
module.exports.getsliderbyid = getsliderbyid;
