const express = require("express");
const router = express.Router();
const path=require("path");
const multer=require('multer')


const profiles = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(file)
      cb(null, 'uploads/profileImg') 
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

  const articles= multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(file)
      cb(null, 'uploads/articles') 
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); 
    }
  });

  const posters= multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/posters') 
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); 
    }
  });

  const category= multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(file)
      cb(null, 'uploads/category') 
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); 
    }
  });

  const sliders= multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(file)
      cb(null, 'uploads/sliders') 
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); 
    }
  });


  const adImages= multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(file)
      cb(null, 'uploads/sliders') 
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); 
    }
  });

  const news= multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(file)
      cb(null, 'uploads/news') 
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); 
    }
  });

  const videos= multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(file)
      cb(null, 'uploads/videos') 
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); 
    }
  });

    
  
const uploadprofile  = multer({ storage: profiles });
const uploadarticles= multer({storage: articles})
const uploadPosters= multer({storage: posters})
const uploadcategory = multer({storage:category})
const uploadsliders= multer({storage:sliders})
const uploadadImages= multer({storage:adImages})
const uploadnewsImages= multer({storage: news})
const uploadvideos= multer({storage:videos})

const admincontroller=require("../controllers/admincontroller")
const userController = require("../controllers/usercontroller");
const reporterController=require("../controllers/reporterController")
const categoryController= require("../controllers/categorycontroler")
const articleController = require("../controllers/articlecontroller")
const middlewareController = require("../middleware/adminmiddleware")
const postercontroller= require("../controllers/postercontroller")
const actioncontroller=require("../controllers/actions")
const dashboardcontroller= require("../controllers/dashboard")
const slidercontroller= require("../controllers/slidercontroller")
const adImageController= require("../controllers/adImagecontroller")
const newscontroller= require("../controllers/newscontroller")
const videocontroller= require("../controllers/videocontroller")
const policycontroller= require("../controllers/policycontroller")

router.post("/get-user", middlewareController.isAuthentication, userController.getuser)
router.post("/update-password",middlewareController.isAuthentication, admincontroller.updatepassword)

router.post("/getdata", dashboardcontroller.getdataforadmin)

module.exports= router