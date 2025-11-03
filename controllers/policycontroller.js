const policymodel = require("../models/policymodel");
const { DateTime } = require("luxon");
const mongoose = require("mongoose");

// const createpolicies = async function (req, res) {
//   try {
//     req.body.logcreatedAt = Date.now();
//     const createpolicy = await policymodel.create(req.body);

//     return res.status(200).send({
//       status: true,
//       data: createpolicy,
//       message: "policy created successfully",
//     });
//   } catch (err) {
//     return res.status(400).send({ status: false, message: err.message });
//   }
// };
const createpolicies = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });
    const time = istDateTime.toFormat("hh:mm a");

    const policy = await policymodel.findOne({});

    if (policy === null) {
      const policyObj = new policymodel({
        privacypolicy: "",
        termsAndConditions: "",
        aboutUs: "",
        contactUs: {},
        logCreatedDate: logDate,
        logModifiedDate: logDate,
      });
      const savepolicy = await policyObj.save();
      if (savepolicy) {
        return res.status(200).json({
          success: true,
          message: "Polcies data has been retrieved successfully",
          policy: savepolicy ?? {},
        });
      }
    } else {
      return res.status(200).json({
        success: true,
        message: "Policies  data has been retrieved successfully",
        policy: policy ?? {},
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};

const addprivacypolicy = async function (req, res) {
  try {
    const editprivacypolicy = await policymodel.updateOne(
      { _id: new mongoose.Types.ObjectId("667911559073e7475eef6e94") },
      { privacypolicy: req.body.content, logUpdatedAt: Date.now() },
      { new: true }
    );
    if (editprivacypolicy)
      return res
        .status(200)
        .send({ status: true, message: "privacy policy updated" });
    return res
      .status(400)
      .send({ status: false, message: "error updating privacy policy" });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ status: false, message: "Something went wrong" });
  }
};

// const addprivacypolicy = async function (req, res) {
//   try {
//     // const istDateTime = DateTime.now().setZone("Asia/Kolkata");
//     // const logDate = istDateTime.toISO({ includeOffset: true });
//     // const time = istDateTime.toFormat("hh:mm a");

//     const upSet = await policymodel.updateOne(
//       {},
//       {
//         $set: {
//           privacyPolicy: req.body.content,
//           updatedAt: Date.now(),
//         },
//       },
//       { new: true }
//     );
//     if (upSet) {
//       return res.status(200).json({
//         success: true,
//         message: "Privacypolicy has been updated",
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Privacypolicy could not be updated",
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res
//       .status(400)
//       .json({ success: false, message: "Something went wrong" });
//   }
// };

const termsAndConditions = async function (req, res) {
  try {
    const tandc = await policymodel.updateOne(
      { _id: new mongoose.Types.ObjectId("667911559073e7475eef6e94") },
      { termsAndConditions: req.body.content, logUpdatedAt: Date.now() },
      { new: true }
    );
    if (tandc)
      return res.status(200).send({
        status: true,
        message: "Terms and Conditions updated successfully",
      });
    return res
      .status(400)
      .send({ status: false, message: "Error updating Terms and Conditions" });
  } catch (err) {
    return res.status(400).send({ status: false, message: err.message });
  }
};

// const termsAndConditions = async function (req, res) {
//   try {
//     const istDateTime = DateTime.now().setZone("Asia/Kolkata");
//     const logDate = istDateTime.toISO({ includeOffset: true });
//     const time = istDateTime.toFormat("hh:mm a");

//     const upSet = await policymodel.updateOne(
//       {},
//       {
//         $set: {
//           termsAndCondition: req.body.termsAndCondition,
//           logModifiedDate: logDate,
//         },
//       },
//       { new: true }
//     );
//     if (upSet) {
//       return res.status(200).json({
//         success: true,
//         message: "TermsAndsCondition  has been updated",
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "TermsAndsCondition  could not be updated",
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res
//       .status(400)
//       .json({ success: false, message: "Something went wrong" });
//   }
// };

const aboutUs = async function (req, res) {
  try {
    const tandc = await policymodel.updateOne(
      { _id: new mongoose.Types.ObjectId("667911559073e7475eef6e94") },
      { aboutUs: req.body.content, logUpdatedAt: Date.now() },
      { new: true }
    );
    if (tandc)
      return res.status(200).send({
        status: true,
        message: "Aboutus updated successfully",
      });
    return res
      .status(400)
      .send({ status: false, message: "Error updating Terms and Conditions" });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ status: false, message: "Something went wrong" });
  }
};
// const aboutUs = async function (req, res) {
//   try {
//     const istDateTime = DateTime.now().setZone("Asia/Kolkata");
//     const logDate = istDateTime.toISO({ includeOffset: true });
//     const time = istDateTime.toFormat("hh:mm a");

//     const upSet = await policymodel.updateOne(
//       {},
//       {
//         $set: {
//           aboutUs: req.body.aboutUs,
//           logModifiedDate: logDate,
//         },
//       },
//       { new: true }
//     );
//     if (upSet) {
//       return res.status(200).json({
//         success: true,
//         message: "Aboutus has been updated",
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Aboutus could not be updated",
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res
//       .status(400)
//       .json({ success: false, message: "Something went wrong" });
//   }
// };

const getpolicy = async function (req, res) {
  try {
    const policydata = await policymodel.findOne({
      _id: new mongoose.Types.ObjectId("667911559073e7475eef6e94"),
    });
    if (policydata)
      return res.status(200).send({
        status: true,
        data: policydata,
        message: "policy data fetched",
      });
    return res
      .status(400)
      .send({ status: false, message: "Error getting policy" });
  } catch (err) {
    return res
      .status(400)
      .send({ status: false, message: "Error getting policy" });
  }
};

const contactUs = async function (req, res) {
  try {
    const mobile = req.body.mobile;
    const email = req.body.email;
    const facebook = req.body.facebook;
    const instagram = req.body.instagram;
    const twitter = req.body.twitter;
    const location = req.body.location;
    const bussiness = req.body.business;

    let obj = {
      mobile: mobile,
      email: email,
      facebook: facebook,
      instagram: instagram,
      twitter: twitter,
      location: location,
      business: bussiness,
    };

    console.log(obj);
    const tandc = await policymodel.updateOne(
      {},
      { contactUs: obj},
      { new: true }
    );
    if (tandc)
      return res.status(200).json({
        status: true,
        message: "Contcat Us Data updated successfully",
        data: tandc,
      });
    return res
      .status(400)
      .send({ status: false, message: "Unable to update details" });
  } catch (err) {
    console.log(err.message);
    return res
      .status(400)
      .send({ status: false, message: "Error creating contactUs" });
  }
};

module.exports.createpolicies = createpolicies;
module.exports.addprivacypolicy = addprivacypolicy;
module.exports.termsAndConditions = termsAndConditions;
module.exports.getpolicy = getpolicy;
module.exports.contactUs = contactUs;
module.exports.aboutUs = aboutUs;
