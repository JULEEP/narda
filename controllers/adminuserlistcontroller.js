// importing models
const userModel = require("../models/usermodel");
const subscribemodel = require("../models/subsciptionmodel");
const mongoose = require("mongoose");
const paymentModel = require("../models/paymentmodel");

// get user list
exports.GETUSERLIST = async function (req, res) {
  try {
    let searchQuery = req.query.searchQuery || req.body.searchQuery || "";
    let regex = new RegExp(searchQuery, "i");

    let condition = {};
    if (searchQuery !== "") {
      condition.$or = [{ name: regex }, { phone: regex }, { email: regex }];
    }

    // ✅ Aggregate users with payment details
    const user = await userModel.aggregate([
      {
        $match: {
          ...condition,
        },
      },
      {
        // 🔗 Join user collection with payment collection
        $lookup: {
          from: "payments", // collection name in MongoDB (check in your DB: usually pluralized)
          localField: "_id",
          foreignField: "customerId",
          as: "paymentDetails",
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    const userCount = user.length;

    return res.status(200).json({
      success: true,
      message: "Data has been retrieved successfully",
      allUsers: user,
      userCount,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// getby id
// GET USER LIST FOR ADMIN
exports.GETUSERLISTBYID = async function (req, res) {
  try {
    const userId = req.body._id;

    const result = await userModel.findOne({ _id: userId });

    let searchQuery = req.query.searchQuery || req.body.searchQuery || "";
    let regex = new RegExp(searchQuery, "i");

    if (searchQuery !== "") {
      condition.$or = [{ name: regex }, { phone: regex }, { email: regex }];
    }

    const user = await userModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },

      {
        $project: {
          _id: 1,
          city: 1,
          email: 1,
          name: 1,
          state: 1,
          phone: 1,
          ceratedAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    const plans = await paymentModel.aggregate([
      {
        $match: {
          customerId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "customerId",
          foreignField: "_id",
          as: "admin",
        },
      },
      {
        $unwind: {
          path: "$admin",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $addFields: {
          userName: "$admin.name",
          userPhone: "$admin.phone",
          userEmail: "$admin.email",
          userState: "$admin.state",
          userCity: "$admin.city",
        },
      },

      {
        $project: {
          _id: 1,
          userName: "$admin.name",
          userPhone: "$admin.phone",
          userEmail: "$admin.email",
          userState: "$admin.state",
          userCity: "$admin.city",
          transactionId: 1,
          status: 1,
          customerId: 1,
          planId: 1,
          planName: 1,
          expirydate: 1,
          price: 1,
          logDateCreated: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Data has been retrieved successfully",
      user,
      plans,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

//plan payments for admin
exports.getallplanpayments = async function (req, res) {
  try {
    let searchQuery = req.query.searchQuery || req.body.searchQuery || ""; // Get searchQuery from query parameters or request body or default to an empty string
    let regex = new RegExp(searchQuery, "i");
    let condition = {};

    const { userName, userEmail } = req.body;

    let paymentlist = await paymentModel.aggregate([
      {
        $lookup: {
          from: "admins",
          localField: "customerId",
          foreignField: "_id",
          as: "admin",
        },
      },
      {
        $unwind: {
          path: "$admin",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $addFields: {
          userName: "$admin.name",
          userEmail: "$admin.email",
          userPhone: "$admin.phone",
          userCity: "$admin.city",
          userState: "$admin.state",
        },
      },

      {
        $project: {
          userName: 1,
          userEmail: 1,
          userPhone: 1,
          userCity: 1,
          userState: 1,
          transactionId: 1,
          status: 1,
          customerId: 1,
          planId: 1,
          planName: 1,
          expirydate: 1,
          price: 1,
          logDateCreated: 1,
        },
      },
      {
        $sort: {
          logDateCreated: -1,
        },
      },
      {
        $match: {
          $and: [
            userName ? { userName: { $regex: new RegExp(userName, "i") } } : {},
            userEmail
              ? { userEmail: { $regex: new RegExp(userEmail, "i") } }
              : {},
            condition,
          ],
        },
      },

      {
        $match: {
          $and: [
            searchQuery
              ? {
                  $or: [{ userName: regex }, { userEmail: regex }],
                }
              : {},
          ],
        },
      },
    ]);

    const count = paymentlist.length;

    res.status(200).json({
      success: true,
      message: "Data have been retrieved successfully",
      data: paymentlist,
      count,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};
