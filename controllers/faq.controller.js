// import models
const faqModel = require("../models/faq");
const { DateTime } = require("luxon");

// addfaq
exports.addfaq = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const faqObj = new faqModel({
      question: req.body.question,
      answer: req.body.answer,
      type: req.body.type,
      logCreatedDate: logDate,
      logModifiedDate: logDate,
    });

    const saveFaq = await faqObj.save();

    if (saveFaq) {
      res.status(200).json({ success: true, message: "Faq has been added" });
    } else {
      res.status(400).json({ success: false, message: "Faq could not be add" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//getAll faqs
exports.getAllfaqs = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition = {
        $or: [{ question: regex }, { answer: regex }, { type: regex }],
      };
    }
    // condition.type = req.body.type;
    console.log(condition);
    const faqs = await faqModel.find(condition).sort({ logCreatedDate: -1 });
    if (faqs) {
      res.status(200).json({
        success: true,
        message: "Faq's has been retrived successfully ",
        faqs: faqs,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//   edit faq
exports.editfaq = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const faq = await faqModel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          question: req.body.question,
          answer: req.body.answer,
          type: req.body.type,
          status: req.body.status,
          logModifiedDate: logDate,
        },
      },
      { new: true }
    );
    if (faq) {
      res.status(200).json({ success: true, message: "Faq has been updated" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

//   delete faq
exports.deletefaq = async function (req, res) {
  try {
    const faq = await faqModel.findOneAndDelete({ _id: req.params.id });
    if (faq) {
      res.status(200).json({ success: true, message: "Deleted successfully" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: "false", message: "Something went wrong" });
  }
};
