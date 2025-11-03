// importing models
const userModel = require("../models/usermodel");
const postermodel = require("../models/postermodel");
const newsModel = require("../models/newsmodel");
const videosmodel = require("../models/videosmodel");
const paymentsModel = require("../models/paymentmodel");
const categoryModel = require("../models/categorymodel");
const articleModel = require("../models/articlemodel");
const languageModel = require("../models/languagemodel");
const slidermodel = require("../models/slidermodel");
const mongoose = require("mongoose");

// get admindashboard
exports.getadmindashboard = async function (req, res) {
  try {
    //  graph monthly:
    const months = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ];

    // users
    const users = await userModel.countDocuments({});

    const postercount = await postermodel.countDocuments({});

    const videoscount = await videosmodel.countDocuments({});

    const slidercount = await slidermodel.countDocuments({});

    // articles
    const artciles = await articleModel.countDocuments({status:"active"});


    const mostArticles = await articleModel.findOne({ status: "active" }).sort({ views: -1 });


    // languages
    const languages = await languageModel.countDocuments({});

    // news
    const news = await newsModel.countDocuments();

    const latestnews = await newsModel.find().sort({ createdAt: -1});

    // articles
    const categories = await categoryModel.countDocuments({});

    const paymentsCount = await paymentsModel.countDocuments({});

    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    //monthly bookings
    // const monthlyNews = await Promise.all(
    //   months.map(async (month) => {
    //     const year = new Date().getMonth() < month - 1 ? nextYear : currentYear;

    //     const startDate = new Date(`${year}-${month}-01`)
    //       .toISOString()
    //       .slice(0, 10); //+
    //     //"T00:00:00.000+05:30";
    //     // "T00:00:00.000Z";
    //     const endDate = new Date(
    //       `${year}-${month}-${new Date(year, month, 0).getDate()}`
    //     )
    //       .toISOString()
    //       .slice(0, 10); //+ "T23:23:23.999+05:30"; // "T23:59:59.999Z";

    //     let condition = {
    //       logCreatedDate: {
    //         $gte: startDate,
    //         $lt: endDate,
    //       },
    //       //status: { $ne: "pending" } // Not equal to "active"
    //     };
    //     console.log(condition);
    //     return await newsModel.countDocuments(condition);
    //   })
    // );

    // //monthly users
    // const monthlyUsers = await Promise.all(
    //   months.map(async (month) => {
    //     const year = new Date().getMonth() < month - 1 ? nextYear : currentYear;

    //     const startDate = new Date(`${year}-${month}-01`)
    //       .toISOString()
    //       .slice(0, 10); //+
    //     //"T00:00:00.000+05:30";
    //     // "T00:00:00.000Z";
    //     const endDate = new Date(
    //       `${year}-${month}-${new Date(year, month, 0).getDate()}`
    //     )
    //       .toISOString()
    //       .slice(0, 10); //+ "T23:23:23.999+05:30"; // "T23:59:59.999Z";

    //     let condition = {
    //       logCreatedDate: {
    //         $gte: startDate,
    //         $lt: endDate,
    //       },
    //       //status: { $ne: "pending" } // Not equal to "active"
    //     };
    //     console.log(condition);
    //     return await userModel.countDocuments(condition);
    //   })
    // );

    //monthly bookings
    /*const monthlyNews = await Promise.all(
      months.map(async (month) => {
        const year = new Date().getMonth() < month - 1 ? nextYear : currentYear;

        const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
        const endDate = new Date(
          `${year}-${month}-${new Date(year, month, 0).getDate()}T23:59:59.999Z`
        );

        let condition = {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
          //status: { $ne: "pending" } // Not equal to "active"
        };
        console.log(condition);
        return await newsModel.countDocuments(condition);
      })
    );*/

    const monthlypaymnets = await Promise.all(
      months.map(async (month) => {
        const year = new Date().getMonth() < month - 1 ? nextYear : currentYear;

        const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
        const endDate = new Date(
          `${year}-${month}-${new Date(year, month, 0).getDate()}T23:59:59.999Z`
        );

        let condition = {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
          //status: { $ne: "pending" } // Not equal to "active"
        };
        console.log(condition);
        return await paymentsModel.countDocuments(condition);
      })
    );

    //monthly users
    const monthlyUsers = await Promise.all(
      months.map(async (month) => {
        const year = new Date().getMonth() < month - 1 ? nextYear : currentYear;

        const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
        const endDate = new Date(
          `${year}-${month}-${new Date(year, month, 0).getDate()}T23:59:59.999Z`
        );

        let condition = {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
          //status: { $ne: "pending" } // Not equal to "active"
        };
        console.log(condition);
        return await userModel.countDocuments(condition);
      })
    );


    console.log(slidercount,"slidercount");
    res.status(200).json({
      success: true,
      message: "Data retrived successfully",
      users,
      paymentsCount,
      artciles,
      news,
      categories,
      languages,
      monthlyUsers,
      mostArticles,
      latestnews,
      monthlypaymnets,
      postercount,
      videoscount,
      slidercount
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};
