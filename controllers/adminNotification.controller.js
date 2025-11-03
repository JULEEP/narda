// importing models
const notificationModel = require("../models/notification");

const { DateTime } = require("luxon");
 const User = require("../models/usermodel");
// const userFcm = require("../services/userFcm");

//add notification
const addNotification = async function (req, res) {
  try {
    console.log(req.body);

    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");
    let message;
    let fcmTokens = [];
    let userIds = [];

    // Function to collect users' FCM tokens and IDs
    const collectUsers = async (users) => {
      let foundUsers = await User.find(
        {
          _id: { $in: users },
          status: "active",
        },
        { _id: 1, fcmtoken: 1, notification_bell: 1 }
      );
      foundUsers.forEach((item) => {
        if (item.notification_bell) {
          userIds.push(item._id.toString());
          fcmTokens.push(item.fcmtoken);
        }
      });
    };

    // Collect all users if req.body.users is "All"
    if (req.body.users === "All") {
      const allUsers = await User.find(
        { status: "active" },
        { _id: 1, fcmtoken: 1, notification_bell: 1 }
      );

      allUsers.forEach((item) => {
        if (item.notification_bell) {
          userIds.push(item._id.toString());
          fcmTokens.push(item.fcmtoken);
        }
      });
    } else {
      // Handle single user ID
      await collectUsers([req.body.users]);
    }

    console.log(userIds);
    console.log(fcmTokens);

    message = {
      registration_ids: fcmTokens,
      notification: {
        title: req.body.title,
        body: req.body.description,
      },
    };

    // // Send notification
    // userFcm.send(message, function (err, response) {
    //   if (err) {
    //     console.log("Failed to send notification:", err);
    //   } else {
    //     console.log("Successfully sent notification with response:", response);
    //   }
    // });

    // Save notification to the database
    new notificationModel({
      date: logDate.slice(0, 10),
      time,
      sendTo: req.body.sendTo,
      users: userIds,
      title: req.body.title,
      description: req.body.description,
      image: req.file ? req.file.path : "",
      logCreatedDate: logDate,
      logModifiedDate: logDate,
    }).save();

    res.status(200).json({
      success: true,
      message: "Notification has been added successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: false, message: "Something went wrong..!" });
  }
};

const getAllNotifications = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition = {
        $or: [{ description: regex }, { title: regex }, { sendTo: regex }],
      };
    }
    // condition.type = "Admin";
    const notifications = await notificationModel.find(condition).sort({
      logCreatedDate: -1,
    });
    if (notifications) {
      res.status(200).json({
        message: "Successful",
        notifications: notifications,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// delete notification
const deleteNotification = async function (req, res) {
  try {
    const notification = await notificationModel.findOneAndDelete({
      _id: req.params.id,
    });
    if (notification) {
      res.status(200).json({ message: "Notifications has been deleted" });
    } else {
      res.status(400).json({ message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

module.exports.addNotification = addNotification;

module.exports.getAllNotifications = getAllNotifications;

module.exports.deleteNotification = deleteNotification;
