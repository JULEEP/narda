const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");


// Set up storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'image') {
      cb(null, 'uploads/videos/');
    } else if (file.fieldname === 'video') {
      cb(null, 'uploads/videos/');
    }
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Set up file filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'image') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image file type'), false);
    }
  } else if (file.fieldname === 'video') {
    if (file.mimetype === "video/mp4" || file.mimetype === "video/mp3" || file.mimetype === "video/3gp" || file.mimetype === "video/mkv") {
      cb(null, true);
    } else {
      cb(new Error('Invalid video file type'), false);
    }
  } else {
    cb(new Error('Invalid file field name'), false);
  }
};

// Set up multer to handle multiple file uploads
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});



const profiles = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, "uploads/profileImg");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const articles = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, "uploads/articles");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const posters = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/posters");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});


const popupImg = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/popup");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const category = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, "uploads/category");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const sliders = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, "uploads/sliders");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const adImages = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, "uploads/adImages");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const addVideos = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, "uploads/adImages");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// News storage
const news = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("📁 NEWS STORAGE - Field:", file.fieldname, "Originalname:", file.originalname);
    cb(null, "uploads/news");
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + path.extname(file.originalname);
    console.log("📄 NEWS FILENAME:", filename);
    cb(null, filename);
  },
});


const videos = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, "uploads/videos");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// plan images
const plans = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, "uploads/plans");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadprofile = multer({ storage: profiles });
const uploadarticles = multer({ storage: articles });
const uploadPosters = multer({ storage: posters });
const uploadPopup = multer({ storage: popupImg });
const uploadcategory = multer({ storage: category });
const uploadsliders = multer({ storage: sliders });
const uploadadImages = multer({ storage: adImages });
const uploadnewsImages = multer({ storage: news });
const uploadvideos = multer({ storage: videos });
const uploadadvideos = multer({ storage: addVideos });
//
const uploadplans = multer({ storage: plans });

const admincontroller = require("../controllers/admincontroller");
const userController = require("../controllers/usercontroller");
const reporterController = require("../controllers/reporterController");
const categoryController = require("../controllers/categorycontroler");
const articleController = require("../controllers/articlecontroller");
const middlewareController = require("../middleware/middleware");
const postercontroller = require("../controllers/postercontroller");
const actioncontroller = require("../controllers/actions");
const dashboardcontroller = require("../controllers/dashboard");
const slidercontroller = require("../controllers/slidercontroller");
const adImageController = require("../controllers/adImagecontroller");
const newscontroller = require("../controllers/newscontroller");
const videocontroller = require("../controllers/videocontroller");
const policycontroller = require("../controllers/policycontroller");
const subscriptioncontroller = require("../controllers/subscriptioncontroller");
const paymentcotroller = require("../controllers/paymentcontroller");
const statecontroller = require("../controllers/statecontroller");
const districtcontroller = require("../controllers/districtcontroller");
const constcontroller = require("../controllers/constcontroller");
const locationcontroller = require("../controllers/locationController");

/************************************************************************************************/
// satish admin panne;
const frontendAdminController = require("../controllers/frontendAdmin.controller");
const faqAdminController = require("../controllers/faq.controller");
const planaAdminController = require("../controllers/plan.controller");

//-----------------------admin routes-------------------------------
router.post("/register", admincontroller.register);
router.post("/otp-login", admincontroller.otplogin);
router.post("/otp-verify", admincontroller.verifyotp);
router.post("/login", admincontroller.login);
router.post(
  "/edit",
  middlewareController.isAuthentication,
  uploadprofile.array("file"),
  admincontroller.editusers
);

//----------------------------user routes-------------------------------
router.get(
  "/get-all-users",
  middlewareController.isAuthentication,
  userController.getallusers
);
router.post(
  "/add-users",
  middlewareController.isAuthentication,
  uploadprofile.single("file"),
  userController.addusers
);
router.post("/update-users", userController.editusers);
router.post("/delete-users", userController.removeUser);
router.post("/block-users", userController.blockUser);
router.post("/search-by-name", userController.searchuser);
router.delete("/delete-user/:userId", userController.deleteUser);
router.post("/deleteaccount", userController.deleteUser);
router.get("/confirm-delete-account/:token", userController.deleteUser);

router.post(
  "/get-user",
  middlewareController.isAuthentication,
  userController.getuser
);
router.post(
  "/add-subcategories",
  middlewareController.isAuthentication,
  userController.addcategory
);

//--------------------reporter routes--------------------------------

router.post(
  "/add-reporter",
  middlewareController.adminAuthentication,
  uploadprofile.single("file"),
  reporterController.addreporter
);
router.put(
  "/update-reporter/:id",
  middlewareController.adminAuthentication,
  uploadprofile.single("file"),
  reporterController.editReporter
);

router.get(
  "/get-reporter",
  middlewareController.adminAuthentication,
  reporterController.getreporter
);

router.get(
  "/getallreporters",
  middlewareController.adminAuthentication,
  reporterController.getallreporters
);

router.post(
  "/delete-reporter/:id",
  middlewareController.adminAuthentication,
  reporterController.removeUser
);

router.post(
  "/getallactiveandinactivereporters",
  middlewareController.adminAuthentication,
  reporterController.getallactiveandinactivereporters
);

router.put(
  "/updatereporterstatus/:id",
  middlewareController.adminAuthentication,
  reporterController.updatereporterstatus
);

//--------------------category routes--------------
router.post(
  "/add-category",
  uploadcategory.array("file"),
  middlewareController.adminAuthentication,
  categoryController.createCategory
);

router.get(
  "/get-all-categoies",
  middlewareController.adminAuthentication,
  categoryController.getallcategory
);

router.put(
  "/editcategory/:id",
  uploadcategory.array("file"),
  middlewareController.adminAuthentication,
  categoryController.editcategory
);

router.delete(
  "/deletecategory/:id",
  middlewareController.adminAuthentication,
  categoryController.deleteCategory
);

//----------------------------- SUBCATEGORIES ------------------------------//
router.post(
  "/create-subcategory",
  uploadcategory.array("file"),
  middlewareController.adminAuthentication,
  categoryController.createsubcat
);

router.put(
  "/edit-subcategory/:id",
  uploadcategory.array("file"),
  middlewareController.adminAuthentication,
  categoryController.editsubcategory
);

router.delete(
  "/deletesubcategory/:id",
  middlewareController.adminAuthentication,
  categoryController.deletesubCategory
);

router.post(
  "/admin/getsubcategorys",
  middlewareController.adminAuthentication,
  categoryController.getsubcats
);

router.get(
  "/get-all-subcategory",
  middlewareController.isAuthentication,
  categoryController.getallsubandcat
);
//----------------------articles routes--------------
// Create article with multiple image fields
router.post(
  "/create-article",
  middlewareController.adminAuthentication,
  uploadarticles.fields([
    { name: "image", maxCount: 5 }, // Main images (max 5)
    { name: "middleImage", maxCount: 1 } // Middle image (only 1)
  ]),
  articleController.createarticle
);
////////
// router.post(
//   "/add-article",
//   middlewareController.adminAuthentication,
//   uploadarticles.array("file"),
//   articleController.createarticle
// );

router.post(
  "/add-article",
  middlewareController.adminAuthentication,
  uploadarticles.single("image"),
  articleController.createarticle
);
router.put(
  "/admin/updatearticlestatus/:id",
  middlewareController.adminAuthentication,
  articleController.updatearticlestatus
);

// new

router.post(
  "/admin/deletearticle",
  middlewareController.adminAuthentication,
  articleController.deleteArticle
);

//new
router.put(
  "/admin/updatearticle/:id",
  middlewareController.adminAuthentication,
  uploadarticles.array("image"),
  articleController.editarticle
);
router.post(
  "/add-more-article",
  uploadarticles.array("file"),
  articleController.addmore
);

router.post(
  "/admin/getalladminarticles",
  middlewareController.adminAuthentication,
  articleController.getAlladminarticles
);

router.post(
  "/edit-article",
  middlewareController.adminAuthentication,
  uploadarticles.array("file"),
  articleController.editarticle
);
router.get("/get-article", articleController.getarticle);

router.post(
  "/delete-article",
  middlewareController.adminAuthentication,
  articleController.deleteArticle
);
router.post(
  "/delete-article/list",
  middlewareController.adminAuthentication,
  articleController.deleteArticlelist
);
router.get(
  "/get-latest-article",
  middlewareController.isAuthentication,
  articleController.getlatestarticle
);

// get byid article
router.post(
  "/admin/getarticlebyid",
  middlewareController.adminAuthentication,
  articleController.getadminarticlebyid
);

router.put(
  "/admin/updatearticle",
  middlewareController.adminAuthentication,
  articleController.updateAllArticlesAllowCopy
);
//------------------poster routes-------------------------

// router.post(
//   "/create-poster",
//   middlewareController.isAuthentication,
//   uploadPosters.array("file"),
//   postercontroller.createposter
// );

//upadate poster

router.put(
  "/updateposterstatus/:id",
  middlewareController.adminAuthentication,
  postercontroller.updateposterstatus
);

router.post(
  "/admin/createposter",
  middlewareController.adminAuthentication,
  uploadPosters.array("file"),  // Use 'file' as the field name to handle multiple files
  postercontroller.createposter
);


router.post(
  "/admin/createadsimg",
  middlewareController.adminAuthentication,
  uploadPopup.single("file"),
  postercontroller.createAdsImage
);


router.get(
  "/admin/getAllAdsImages",
  //middlewareController.adminAuthentication,
  postercontroller.getAllAdsImages
);


router.delete(
  "/admin/deletepopup/:id",
  //middlewareController.adminAuthentication,
  postercontroller.deleteAdsImage
);

router.get(
  "/admin/getAllAdsImageswithquery",
  //middlewareController.adminAuthentication,
  postercontroller.getAllAdsImagesWithQuery
);



router.post(
  "/admin/getposterbyid",
  middlewareController.adminAuthentication,
  postercontroller.getposterbyid
);

router.put(
  "/admin/updateposter/:id",
  middlewareController.adminAuthentication,
  uploadPosters.single("file"),
  postercontroller.updatePoster
);

router.post(
  "/getalladminposters",
  middlewareController.adminAuthentication,
  postercontroller.getAlladminposters
);

router.delete(
  "/admin/deleteposter/:id",
  middlewareController.adminAuthentication,
  postercontroller.deleteadminposter
);

router.post(
  "/admin/deletecomment",
  middlewareController.adminAuthentication,
  postercontroller.deletecomment
);

router.get(
  "/get-all-posters",
  middlewareController.isAuthentication,
  postercontroller.getallposters
);

router.post(
  "/get-ads-image",
  middlewareController.isAuthentication,
  postercontroller.getadsimage
);
router.get("/get-poster", postercontroller.getposter);
router.post(
  "/delete-poster",
  middlewareController.isAuthentication,
  postercontroller.deleteposter
);
router.get(
  "/get-latest-posters",
  middlewareController.isAuthentication,
  postercontroller.getlatestposters
);
router.get(
  "/get-all-likes",
  middlewareController.isAuthentication,
  postercontroller.getalllikes
);

//-------------------news routes------------------------------------
// router.post(
//   "/create-news",
//   middlewareController.isAuthentication,
//   uploadnewsImages.array("image"),
//   newscontroller.createNews
// );


// Routes
router.post(
  "/admin/create-news",
  middlewareController.adminAuthentication,
  (req, res, next) => {
    console.log("🛣️ /create-news route HIT");
    next();
  },
  uploadnewsImages.fields([
    { name: "image", maxCount: 5 },
    { name: "middleImage", maxCount: 1 }
  ]),
  (req, res, next) => {
    console.log("✅ Multer passed - Files received:", req.files);
    next();
  },
  newscontroller.createNews
);

router.get("/get-news", newscontroller.getnews);

router.get(
  "/get-latest-news",
    middlewareController.isAuthentication,
  newscontroller.getlatestnews
);

router.get("/get-all-news", newscontroller.getall);

router.post(
  "/add-more-news",
  uploadnewsImages.array("file"),
  newscontroller.addmore
);

// -----------------------------------------------
//getall
router.post(
  "/admin/getallnews",
  middlewareController.adminAuthentication,
  newscontroller.getAlladminnews
);

//delete
router.delete(
  "/admin/deletenews/:id",
  middlewareController.adminAuthentication,
  newscontroller.deleteadminnews
);

//update news status:id
router.put(
  "/admin/updatenewsstatus/:id",
  middlewareController.adminAuthentication,
  newscontroller.updatenewsstatus
);

//get single news byid
router.post(
  "/admin/getsinglenewsbyid",
  middlewareController.adminAuthentication,
  newscontroller.getsinglenewsbyid
);

//j1
// router.post(
//   "/admin/addnews",
//   middlewareController.adminAuthentication,
//   uploadnewsImages.array("image"),
//   newscontroller.createNews
// );

router.put(
  "/admin/editnews/:id",
  middlewareController.adminAuthentication,
  uploadnewsImages.fields([
    { name: 'image', maxCount: 5 },
    { name: 'middleImage', maxCount: 1 }
  ]),
  newscontroller.updatenews
);


router.put(
  "/admin/allow-copy",
  middlewareController.adminAuthentication,
  newscontroller.updateAllNewsAllowCopy
);

//add news
// router.post(
//   "/admin/addnews",
//   middlewareController.adminAuthentication,
//   uploadnewsImages.fields([
//     { name: "image", maxCount: 10 },
//     { name: "banner", maxCount: 1 },
//   ]),
//   newscontroller.addnews
// );
//-------------slider routes------------------------------------

// router.post(
//   "/create-slider",
//   middlewareController.isAuthentication,

//   uploadsliders.array("file"),
//   slidercontroller.createsliders
// );
router.get("/get-slider", slidercontroller.getslider);
router.get(
  "/get-all-sliders",
  middlewareController.isAuthentication,
  slidercontroller.getallsliders
);

// admi add sliders
router.post(
  "/create-slider",
  middlewareController.adminAuthentication,
  uploadsliders.fields([{ name: "sliders", maxCount: 10 }]),
  slidercontroller.createsliders
);

// admi getall sliders
router.post(
  "/getalladminsliders",
  middlewareController.adminAuthentication,
  slidercontroller.getAlladminsliders
);

router.post(
  "/admin/getsliderbyid",
  middlewareController.adminAuthentication,
  slidercontroller.getsliderbyid
);

//edit slider
router.put(
  "/editslider/:id",
  middlewareController.adminAuthentication,
  uploadsliders.fields([{ name: "sliders", maxCount: 10 }]),
  slidercontroller.editadminslider
);

// delete admin slider
router.delete(
  "/deleteslider/:id",
  middlewareController.adminAuthentication,
  slidercontroller.deleteslider
);
//------------------adImage Routes--------------------------------

router.post(
  "/create-advideo",
  middlewareController.isAuthentication,
  uploadadvideos.array("file"),
  function (req, res, next) {
    validateAspectRatios(req, res, next);
  },
  adImageController.createadvideo
);

function validateAspectRatios(req, res, next) {
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const invalidFiles = files.filter((file) => {
    const aspectRatio = calculateAspectRatio(file.path);
    console.log(aspectRatio, "ratiooo");
    return Math.abs(aspectRatio - 9 / 16) >= 0.01; // Check if aspect ratio is not approximately 9:16
  });

  if (invalidFiles.length >= 2) {
    return res
      .status(400)
      .json({ error: "Uploaded videos must have an aspect ratio of 9:16" });
  }

  next();
}

function calculateAspectRatio(videoPath) {
  return 16 / 9;
}

router.post(
  "/create-adImage",
  middlewareController.isAuthentication,
  uploadadImages.array("file"),
  adImageController.createadimage
);
// router.post("/create-advideo", middlewareController.isAuthentication, uploadadvideos.array('file'), adImageController.createadvideo)
router.get("/get-adImage", adImageController.getadimage);
router.get("/get-all-adImages", adImageController.getalladImages);

//--------------- --------likes commennts controller ------------------------------------
router.post(
  "/like-content",
  middlewareController.isAuthentication,
  actioncontroller.likePoster
);
router.get("/get-all-likes", actioncontroller.getlikes);
router.post("/get-all-comments", actioncontroller.getcomments);
router.post(
  "/comment-content",
  middlewareController.isAuthentication,
  middlewareController.isAuthentication,
  actioncontroller.commentPoster
);
router.post(
  "/bookmark",
  middlewareController.isAuthentication,
  actioncontroller.bookmark
);
router.post(
  "/get-all-bookmarks",
  middlewareController.isAuthentication,
  actioncontroller.viewallbookmarks
);
router.post("/get-bookmark-data", actioncontroller.viewbookmark);
router.post(
  "/get-unread",
  middlewareController.isAuthentication,
  dashboardcontroller.getunread
);

// ----------------------------video routes--------------------------------------
router.post(
  "/create-video",
  middlewareController.adminAuthentication,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]),
  videocontroller.createvideo
);



router.get("/get-latest-videos", videocontroller.getlatestVideos);
router.get(
  "/get-all-videos",
  middlewareController.isAuthentication,
  videocontroller.getallvideos
);
router.get("/get-video", videocontroller.getvideo);

// -------------------------J1 NEW

router.post(
  "/admin/getvideobyid",
  middlewareController.adminAuthentication,
  videocontroller.getvideobyid
);

router.post(
  "/admin/getallvideos",
  middlewareController.adminAuthentication,
  videocontroller.getAlladminvideos
);

router.put(
  "/admin/updatevideostatus/:id",
  middlewareController.adminAuthentication,
  videocontroller.updatevideostatus
);

router.delete(
  "/admin/deletevideo/:id",
  middlewareController.adminAuthentication,
  videocontroller.deleteadminvideo
);

router.post(
  "/admin/create-video",
  middlewareController.adminAuthentication,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]),
  videocontroller.createvideo
);

router.put(
  "/admin/update-video/:id",
  middlewareController.adminAuthentication,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]),
  videocontroller.updateVideo
);
//------------------Dashboard Routes-------------------------------------------------
router.get("/get-all-likes-poster", postercontroller.getalllikes);
router.get("/get-all-likes-sliders", slidercontroller.getalllikes);
router.get("/get-all-likes-adImage", adImageController.getalllikes);
// router.get("/get-all-articles", articleController.getall);
router.get("/get-all-articles",
  middlewareController.isAuthentication,
  articleController.getall);
router.post("/get-all-data", dashboardcontroller.getalldata);
router.post(
  "/getById",
  middlewareController.isAuthentication,
  dashboardcontroller.getById
);
router.post("/get-latest", dashboardcontroller.getlatest);
router.post("/search-data", actioncontroller.searchdata);

//--------------------------policy routes--------------------------
router.post(
  "/create-policy",
  // middlewareController.adminAuthentication,
  policycontroller.createpolicies
);
router.post(
  "/edit-privacypolicy",
  middlewareController.adminAuthentication,
  policycontroller.addprivacypolicy
);
router.post(
  "/edit-termsandconditions",
  middlewareController.adminAuthentication,
  policycontroller.termsAndConditions
);

router.post(
  "/edit-aboutus",
  middlewareController.adminAuthentication,
  policycontroller.aboutUs
);

router.post(
  "/edit-contactUs",
  middlewareController.adminAuthentication,
  policycontroller.contactUs
);
router.get("/get-policies", policycontroller.getpolicy);

//--------------------------subscriptio routes-------------------------------
// api for admin
router.post(
  "/add-plans",
  middlewareController.adminAuthentication,
  //uploadplans.single("file"),
  subscriptioncontroller.createsubscription
);


router.post(
  "/add-seubscriptionpopup",
  uploadPopup.single("popupImg"),
  subscriptioncontroller.subscriptionPopup
);


router.get(
  "/get-subscriptions",
  subscriptioncontroller.getsubscriptionPopup
);

router.delete(
"/delete-subscriptionpopup/:id",
  subscriptioncontroller.deletesubscription
);


router.post(
  "/getalladminplans",
  middlewareController.adminAuthentication,
  subscriptioncontroller.getAlladminplans
);
router.put(
  "/edit-plans/:id",
  middlewareController.adminAuthentication,
  uploadplans.single("file"),
  subscriptioncontroller.editsubscription
);
router.delete(
  "/delete-plans/:id",
  middlewareController.adminAuthentication,
  subscriptioncontroller.deletesubscription
);
router.delete(
  "/admin/deleteArticleId/",
  middlewareController.adminAuthentication,
  articleController.deleteArticleId
);

router.get(
  "/get-plans",
  middlewareController.isAuthentication,
  subscriptioncontroller.getallplans
);

//---------------payment routes---------------------------------

router.post(
  "/add-payment",
  middlewareController.isAuthentication,
  paymentcotroller.createPayment
);


//apple purchase payment api

router.post(
  "/paywithapple",
  middlewareController.isAuthentication,
  paymentcotroller.payWithApple
);


router.post("/webhook", paymentcotroller.handleAppleWebhook);


//--------------------------------state routesss-------------------------------------

router.post(
  "/add-state",
  middlewareController.adminAuthentication,
  statecontroller.addState
);
router.post(
  "/get-all-state",
  middlewareController.adminAuthentication,
  statecontroller.getAllStates
);
router.post("/get-app-states", statecontroller.getAllAppNonDeletedStates);
router.post(
  "/edit-state",
  middlewareController.adminAuthentication,
  statecontroller.editState
);
router.post(
  "/delete-state",
  middlewareController.adminAuthentication,
  statecontroller.deleteState
);
router.post(
  "/get-state",
  middlewareController.adminAuthentication,
  statecontroller.getState
);

//--------------------------------------district routesss----------------------------------
router.post(
  "/add-district",
  middlewareController.adminAuthentication,
  districtcontroller.addDistrict
);
router.post(
  "/get-all-districts",
  middlewareController.adminAuthentication,
  districtcontroller.getAllDistricts
);
router.post(
  "/get-districts-by-state",
  middlewareController.adminAuthentication,
  districtcontroller.getAllDistrictByState
);
router.post(
  "/get-app-districts-states",
  districtcontroller.getAllAppDistrictByState
);
router.post(
  "/edit-districts",
  middlewareController.adminAuthentication,
  districtcontroller.editDistrict
);

router.post(
  "/delete-districts",
  middlewareController.adminAuthentication,
  districtcontroller.deleteDistrict
);

//----------------------------constituncy routes------------------------------------
router.post(
  "/add-constituency",
  middlewareController.adminAuthentication,
  constcontroller.addConstituency
);

router.post(
  "/get-all-constituencies",
  middlewareController.adminAuthentication,
  constcontroller.getAllNonDeletedConstituency
);
router.post(
  "/get-app-contituencies",
  constcontroller.getAllNonDeletedConstituency
);
router.post(
  "/get-constituencyByDist",
  constcontroller.getAllConstituenciesByDist
);
router.post(
  "/get-app-constituenciesByDist",
  constcontroller.getAllAppConstituenciesByDist
);
router.post(
  "/edit-contituency",
  middlewareController.adminAuthentication,
  constcontroller.editConstituency
);

router.post(
  "/delete-contituency/:id",
  middlewareController.adminAuthentication,
  constcontroller.deleteConstituency
);

//--------------------------------state and district for appps-------------------------

router.post("/get-state-district", statecontroller.stateAndDistrict);

//-----------------------------location routes--------------------------
router.post(
  "/add-user-locations",
  middlewareController.isAuthentication,
  userController.addlocations
);
router.post("/create-loctaion", locationcontroller.createLocation);

router.post(
  "/get-all-loctaions",
  middlewareController.isAuthentication,
  locationcontroller.getallocations
);
//----------------------for admin------------------------
router.post(
  "/admin/add-loctaion",
  middlewareController.adminAuthentication,
  locationcontroller.createLocation
);

//getall
router.post(
  "/admin/getalllocations",
  middlewareController.adminAuthentication,
  locationcontroller.getalladminlocations
);

router.put(
  "/admin/updatelocation/:id",
  middlewareController.adminAuthentication,
  locationcontroller.editlocation
);

router.delete(
  "/admin/deletelocation/:id",
  middlewareController.adminAuthentication,
  locationcontroller.deletelocation
);

/**********************************************************************************************************
 *********************************************************************************************************/
///controllers  for satish admipannel
// admin registration
router.post(
  "/adminregister",
  // middlewareController.isAuthentication,
  frontendAdminController.adminRegistration
);

// admin login
router.post(
  "/adminlogin",
  // middlewareController.isAuthentication,
  frontendAdminController.adminlogin
);

// admin get profile
router.post(
  "/admin/getprofile",
  middlewareController.adminAuthentication,
  frontendAdminController.getadminProfile
);

// update profile
router.put(
  "/admin/updateprofile",
  middlewareController.adminAuthentication,
  frontendAdminController.updateprofile
);

// update profileimage
router.put(
  "/admin/updateprofileimage",
  middlewareController.adminAuthentication,
  uploadprofile.single("profilePic"),
  frontendAdminController.updateadminProfileImg
);

// chnage password
router.post(
  "/admin/changeadminpassword",
  middlewareController.adminAuthentication,
  frontendAdminController.changeAdminpassword
);

// change password
router.post("/admin/generateotp", frontendAdminController.generateOtp);

router.post("/admin/compareotp", frontendAdminController.compareOtp);

router.post("/admin/resetpassword", frontendAdminController.resetpassword);

//--------------------------------------- FAQ'S ---------------------------------------/
// add faq
router.post(
  "/admin/faq/addfaq",
  middlewareController.adminAuthentication,
  faqAdminController.addfaq
);

// get all faqs
router.post(
  "/admin/faq/getallfaqs",
  middlewareController.adminAuthentication,
  faqAdminController.getAllfaqs
);

// get all faqs
router.post(
  "/admin/faq/getallfaqs",
  middlewareController.adminAuthentication,
  faqAdminController.getAllfaqs
);

// update faqs
router.post(
  "/admin/faq/updatefaq/:id",
  middlewareController.adminAuthentication,
  faqAdminController.editfaq
);

// update faqs
router.put(
  "/admin/faq/updatefaq/:id",
  middlewareController.adminAuthentication,
  faqAdminController.editfaq
);

// update faqs
router.delete(
  "/admin/faq/deletefaq/:id",
  middlewareController.adminAuthentication,
  faqAdminController.deletefaq
);

//------------------------------------- PLANS ----------------------------------------------//
// plans
router.post(
  "/admin/plan/addplan",
  middlewareController.adminAuthentication,
  uploadplans.single("image"),
  planaAdminController.addplan
);

router.post(
  "/admin/plan/getallplans",
  middlewareController.adminAuthentication,
  uploadplans.none(),
  planaAdminController.getAllplans
);
router.post(
  "/admin/getallpayments",
  middlewareController.adminAuthentication,
  uploadplans.none(),
  subscriptioncontroller.getallpayments
);

router.put(
  "/admin/plan/ediplan/:id",
  middlewareController.adminAuthentication,
  uploadplans.single("image"),
  planaAdminController.editplan
);

router.delete(
  "/admin/plan/deleteplan/:id",
  middlewareController.adminAuthentication,
  uploadplans.single("image"),
  planaAdminController.deleteplan
);

//------------------------------------- PLANS END ----------------------------------------------//
module.exports = router;
