const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

//
const profiles = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, "uploads/profileImg");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const adsImage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, "uploads/ads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const notifications = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, "uploads/notificationImg");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const banners = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, "uploads/bannerImg");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadprofile = multer({ storage: profiles });
const uploadnotification = multer({ storage: notifications });
const uploadbanner = multer({ storage: banners });
const uploadadsImage = multer({ storage: adsImage });

// middleware
const middlewareController = require("../middleware/middleware");

const admindepartmentcontroller = require("../controllers/adminDepartment.controller");
const adminroleController = require("../controllers/adminrole.controller");
const adminstaffController = require("../controllers/adminstaff.controller");
const adminnotificationController = require("../controllers/adminNotification.controller");
const adminuserlistController = require("../controllers/adminuserlistcontroller");
const adminbannerController = require("../controllers/adminbannercontroller");
const admindashboardController = require("../controllers/adminDashboard.controller");
const adsController = require("../controllers/adscontroller");
const adminContactController = require("../controllers/contactAdmin");

//---------------------------------  ADMIN CONTACT --------------------------------------//

router.post(
  "/getAdminDetails",
 // middlewareController.adminAuthentication,
  adminContactController.getAdminDetails
);

router.post(
  "/addAdminDetails",
 // middlewareController.adminAuthentication,
  adminContactController.addAdminDetails
);

router.put(
  "/editAdminDetails",
 // middlewareController.adminAuthentication,
  adminContactController.editAdminDetails
);

//---------------------------------  DEPARTMENTS --------------------------------------//
// add department
router.post(
  "/admin/department/adddepartment",
  middlewareController.adminAuthentication,
  admindepartmentcontroller.adddepartment
);

// getall departments
router.post(
  "/admin/department/getalldepartments",
  middlewareController.adminAuthentication,
  admindepartmentcontroller.getdepartments
);

router.put(
  "/admin/department/edit/:id",
  middlewareController.adminAuthentication,
  admindepartmentcontroller.editdepartment
);

// getall departments
router.delete(
  "/admin/department/delete/:id",
  middlewareController.adminAuthentication,
  admindepartmentcontroller.deletedepartment
);

//---------------------------------  ROLES --------------------------------------//
router.post(
  "/admin/role/addrole",
  middlewareController.adminAuthentication,
  adminroleController.addrole
);

// getall departments
router.post(
  "/admin/role/getallroles",
  middlewareController.adminAuthentication,
  adminroleController.getAllroles
);

router.put(
  "/admin/role/edit/:id",
  middlewareController.adminAuthentication,
  adminroleController.editrole
);

// getall departments
router.delete(
  "/admin/role/delete/:id",
  middlewareController.adminAuthentication,
  adminroleController.deleterole
);

// getall departments
router.delete(
  "/admin/role/delete/:id",
  middlewareController.adminAuthentication,
  adminroleController.deleterole
);

// getall departments
router.post(
  "/admin/role/getrole",
  middlewareController.adminAuthentication,
  adminroleController.getRole
);

//---------------------------------  STAFF --------------------------------------//
router.post(
  "/admin/staff/addstaff",
  middlewareController.adminAuthentication,
  uploadprofile.single("profilepic"),
  adminstaffController.addstaff
);

// getall departments
router.put(
  "/admin/staff/editstaf/:id",
  uploadprofile.single("profilepic"),
  middlewareController.adminAuthentication,
  adminstaffController.editdstaff
);

router.post(
  "/admin/staff/getallstaff",
  middlewareController.adminAuthentication,
  adminstaffController.getAllstaff
);

router.delete(
  "/admin/staff/delete/:id",
  middlewareController.adminAuthentication,
  adminstaffController.deletestaff
);

//---------------------------------  NOTIFICATIONS --------------------------------------//
//ADD
router.post(
  "/admin/notification/add",
  uploadnotification.single("image"),
  middlewareController.adminAuthentication,
  adminnotificationController.addNotification
);

//getall
router.post(
  "/admin/notification/getall",
  middlewareController.adminAuthentication,
  adminnotificationController.getAllNotifications
);

//delete
router.delete(
  "/admin/notification/delete/:id",
  middlewareController.adminAuthentication,
  adminnotificationController.deleteNotification
);

//--------------------------------- USER LIST --------------------------------------//
// user list
router.post(
  "/admin/user/userlist",
  middlewareController.adminAuthentication,
  adminuserlistController.GETUSERLIST
);

//get by id for admin : user
router.post(
  "/admin/user/getbyid",
  middlewareController.adminAuthentication,
  adminuserlistController.GETUSERLISTBYID
);

//get plan payments for admin
router.post(
  "/admin/planpayments",
  middlewareController.adminAuthentication,
  adminuserlistController.getallplanpayments
);

//------------------------------ BANNERS --------------------------------------//
router.post(
  "/admin/addbanner",
  uploadbanner.single("image"),
  middlewareController.adminAuthentication,
  adminbannerController.addbanner
);

router.post(
  "/admin/getallbanners",
  middlewareController.adminAuthentication,
  adminbannerController.getAllbanners
);

router.put(
  "/admin/editbanner/:id",
  uploadbanner.single("image"),
  middlewareController.adminAuthentication,
  adminbannerController.editbanner
);

router.delete(
  "/admin/deletebanner/:id",
  middlewareController.adminAuthentication,
  adminbannerController.deletebanner
);

// admin dashboard
router.post(
  "/admin/admindashboard",
  middlewareController.adminAuthentication,
  admindashboardController.getadmindashboard
);



// admin dashboard
router.post(
  "/admin/createAds",
  //middlewareController.adminAuthentication,
  uploadadsImage.array("image", 5),  // Allows up to 5 files for "image" field
  adsController.createAds
);
router.post(
  "/admin/ads/getall",
  middlewareController.adminAuthentication,
  adsController.getall
);
router.post(
  "/admin/ads/update",
  middlewareController.adminAuthentication,
  uploadadsImage.single("image"),
  adsController.update
);

router.post(
  "/admin/ads/delete",
  middlewareController.adminAuthentication,
  adsController.deleteads
);

router.post(
  "/admin/ads/adsImageUpdate",
  uploadadsImage.single("image"),
  middlewareController.adminAuthentication,
  adsController.adsImageUpdate
);
router.post(
  "/admin/ads/getadsimage",
  middlewareController.adminAuthentication,
  adsController.getadsimage
);






module.exports = router;
