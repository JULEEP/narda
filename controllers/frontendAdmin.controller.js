// importing models
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

// To read a ejs file || template engine
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const axios = require("axios");

// importing models
const Admin = require("../models/frontendAdmin");
const otpModel = require("../models/otp");
const staffModel = require("../models/staff");
const roleModel = require("../models/roleAndPermission");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { DateTime } = require("luxon");

// admin registration
exports.adminRegistration = async function (req, res) {
  try {
    const { DateTime } = require("luxon");
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    console.log(
      "password--------------------------------------------:",
      req.body.password
    );

    console.log(req.body);

    // Validate the presence of password in request body
    if (!req.body.password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    const user = await Admin.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    });
    if (user) {
      res.status(400).json({
        success: false,
        message: "This user is already registered",
      });
    }

    const bcryptedpassword = bcrypt.hashSync(req.body.password, 10);

    console.log(
      "Password hashed-----------------------------------:",
      bcryptedpassword
    );

    const adminEmpObj = new Admin({
      name: req.body.name,
      email: req.body.email,
      password: bcryptedpassword,
      phone: req.body.phone,
      address: req.body.address,
      status: "active",
      rolesAndPermission: [
        {
          Dashview: true,
        },
      ],
      logCreatedDate: logDate,
      logModifiedDate: logDate,
    });
    const userData = await adminEmpObj.save();
    if (userData) {
      return res.status(200).json({
        success: true,
        message: "The user is registered successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "The user is not registered",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// admin login
//only admin login
// exports.adminlogin = async function (req, res) {
//   const user = await Admin.findOne({
//     $or: [{ email: req.body.email }, { phone: req.body.phone }],
//   });
//   if (user !== null) {
//     const password = req.body.password;
//     const pass = bcrypt.compareSync(password, user.password);
//     if (pass == true && user.status === "active") {
//       let token = jwt.sign(
//         {
//           userId: user._id,
//           password: user.password,
//           phone: user.phone,
//           email: user.email,
//         },

//         "mytokenscret",
//         { expiresIn: "365d" }
//       );
//       const userData = {
//         _id: user._id,
//         email: user.email,
//         name: user.name,
//         phone: user.phone,
//       };
//       let rolesAndPermission =
//         user.rolesAndPermission.length !== 0 ? user.rolesAndPermission[0] : {};
//       return res.status(200).json({
//         success: true,
//         message: "You have successfully loged in",
//         token: token,
//         user: userData,
//         rolesAndPermission: rolesAndPermission,
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "User inactive or incorrect password",
//       });
//     }
//   } else {
//     return res.status(400).json({
//       success: false,
//       message: "Please provide a correct email address or phone number",
//     });
//   }
// };

//the staff and admin login
exports.adminlogin = async function (req, res) {
  const user = await Admin.findOne({
    $or: [{ email: req.body.email }, { phone: req.body.email }],
  });
  if (user !== null) {
    const password = req.body.password;
    const pass = bcrypt.compareSync(password, user.password);
    if (pass == true && user.status === "active") {
      let token = jwt.sign(
        {
          userId: user._id,
          password: user.password,
          phone: user.phone,
          email: user.email,
        },

        "mytokenscret",
        { expiresIn: "365d" }
      );
      const userData = {
        _id: user._id,
        department: "Admin",
        email: user.email,
        name: user.name,
        phone: user.phone,
      };

      let rolesAndPermission =
        user.rolesAndPermission.length !== 0 ? user.rolesAndPermission[0] : {};
      return res.status(200).json({
        success: true,
        message: "You have successfully loged in",
        token: token,
        user: userData,
        rolesAndPermission: [{ accessAll: true }],
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "User inactive or incorrect password",
      });
    }
  } else {
    const staff = await staffModel.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.email }],
    });
    if (staff !== null) {
      const password = req.body.password;
      const pass = bcrypt.compareSync(password, staff.password);
      if (pass == true) {
        let token = jwt.sign(
          {
            staffId: staff._id,
            password: staff.password,
            phone: staff.phone,
            email: staff.email,
          },

          "mytokenscret",
          { expiresIn: "365d" }
        );
        const staffData = {
          _id: staff._id,
          department: "Staff",
          email: staff.email,
          name: staff.name,
          phone: staff.phone,
        };

        const rolesdata = await roleModel.findOne({
          _id: new ObjectId(staff.roleId),
        });
        if (!rolesdata) {
          return res.status(400).json({
            success: true,
            message: "Invalid role. Please modify staff role",
          });
        }

        let rolesAndPermission =
          rolesdata.rolesAndPermission.length !== 0
            ? rolesdata.rolesAndPermission
            : {};

        // console.log("rolesAndPermission", rolesAndPermission);
        return res.status(200).json({
          success: true,
          message: "You have successfully loged in",
          token: token,
          user: staffData,
          rolesAndPermission: rolesAndPermission,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "User inactive or incorrect password",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide a correct email address or phone number",
      });
    }
  }
};

// get adminprofile
// exports.getadminProfile = async function (req, res) {
//   try {
//     const profileResult = await Admin.findOne(
//       {
//         _id: req.userId,
//       },
//       {
//         name: 1,
//         email: 1,
//         phone: 1,
//         status: 1,
//         address: 1,
//         role: 1,
//         profilePic: 1,
//         rolesAndPermission: 1,
//       }
//     );
//     if (profileResult) {
//       res.status(200).json({
//         success: true,
//         message: "Your data was successfully retrived",
//         profileResult,
//       });
//     } else {
//       res.status(400).json({ success: false, message: "Bad request" });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({ success: false, message: "Something went wrong" });
//   }
// };

// admin and staff profile to get
exports.getadminProfile = async function (req, res) {
  try {
    console.log("USERR ID --->", req.userId);
    let profile = null;

    // Check if the user is an admin and retrieve the profile data
    const adminProfile = await Admin.findOne({ _id: req.userId });

    if (adminProfile) {
      profile = {
        _id: adminProfile._id,
        name: adminProfile.name,
        email: adminProfile.email,
        phone: adminProfile.phone,
        address: adminProfile.address,
        status: adminProfile.status,
        profilePic: adminProfile.profilePic, // Assuming profilePic is a field in the Admin model
        rolesAndPermission: adminProfile.rolesAndPermission || [], // Provide default empty array if rolesAndPermission is null
      };
    } else {
      // Check if the user is a staff and retrieve the profile data
      const staffProfile = await staffModel.findOne({ _id: req.userId });

      if (staffProfile) {
        profile = {
          _id: staffProfile._id,
          name: staffProfile.name,
          email: staffProfile.email,
          phone: staffProfile.phone,
          address: staffProfile.address,
          status: staffProfile.status,
          profilePic: staffProfile.profilepic || "", // Assuming profilePic is a field in the staff model
          // rolesAndPermission: staffProfile.rolesAndPermission || [], // Provide default empty array if rolesAndPermission is null
        };
      } else {
        return res.status(404).json({
          success: false,
          message: "Profile data not found",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Your data was successfully retrieved",
      profileResult: profile,
    });
  } catch (error) {
    console.log("Error:", error);
    return res.status(400).json({
      success: false,
      message: "Bad request",
      error: error.message, // Send error message to client for debugging
    });
  }
};

// upate admin profilepic
// exports.updateadminProfileImg = async function (req, res) {
//   try {
//     const { DateTime } = require("luxon");
//     const istDateTime = DateTime.now().setZone("Asia/Kolkata");
//     const logDate = istDateTime.toISO({ includeOffset: true });

//     const upProfileImg = await Admin.findOneAndUpdate(
//       {
//         _id: req.userId,
//       },
//       {
//         $set: {
//           profilePic: req.file ? req.file.path : "",
//           logModifiedDate: logDate,
//         },
//       },
//       {
//         new: true,
//       }
//     );
//     if (upProfileImg) {
//       res
//         .status(200)
//         .json({ success: true, message: "Profile Image has been updated" });
//     } else {
//       res.status(400).json({ success: false, message: "Bad request" });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({ success: false, message: "Something went wrong" });
//   }
// };
// updating the staff profile pic and admin profile pic
exports.updateadminProfileImg = async function (req, res) {
  try {
    console.log("Request File:", req.file); // Check if req.file is populated
    console.log("User ID:", req.userId); // Check the value of req.userId

    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    let updatedProfilePic;

    const staff = await staffModel.findOne({ _id: req.userId });
    const admin = await Admin.findOne({ _id: req.userId });

    if (staff) {
      updatedProfilePic = await staffModel.findOneAndUpdate(
        { _id: req.userId },
        {
          $set: {
            profilepic: req.file ? req.file.path : "",
            logModifiedDate: logDate,
          },
        },
        { new: true }
      );
    } else if (admin) {
      updatedProfilePic = await Admin.findOneAndUpdate(
        { _id: req.userId },
        {
          $set: {
            profilePic: req.file ? req.file.path : "",
            logModifiedDate: logDate,
          },
        },
        { new: true }
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("Updated Profile Pic:", updatedProfilePic); // Log the updated document

    if (updatedProfilePic) {
      return res.status(200).json({
        success: true,
        message: "Profile picture has been updated",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to update profile picture",
      });
    }
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};

// update admin profile
// exports.updateprofile = async function (req, res) {
//   try {
//     const { DateTime } = require("luxon");
//     const istDateTime = DateTime.now().setZone("Asia/Kolkata");
//     const logDate = istDateTime.toISO({ includeOffset: true });

//     const UpProfile = await Admin.findOneAndUpdate(
//       { _id: req.userId },
//       {
//         $set: {
//           name: req.body.name,
//           email: req.body.email,
//           phone: req.body.phone,
//           address: req.body.address,
//           logModifiedDate: logDate,
//         },
//       },
//       {
//         new: true,
//       }
//     );
//     if (UpProfile) {
//       res
//         .status(200)
//         .json({ success: true, message: "Your profile has been updated" });
//     } else {
//       res.status(400).json({ success: false, message: "Bad request" });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({ success: false, message: "Something went wrong" });
//   }
// };

// To update the admin profile and staff profile
exports.updateprofile = async function (req, res) {
  try {
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const updatedAdmin = await Admin.updateOne(
      { _id: req.userId },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          address: req.body.address,
          status: req.body.status,
          logModifiedDate: logDate,
        },
      },
      {
        new: true,
      }
    );

    if (updatedAdmin) {
      // Update staff profile
      const updatedStaff = await staffModel.updateOne(
        { _id: req.userId },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            status: req.body.status,
            logModifiedDate: logDate,
          },
        },
        {
          new: true,
        }
      );

      if (updatedStaff) {
        res
          .status(200)
          .json({ success: true, message: "Profile updated successfully" });
      } else {
        res
          .status(400)
          .json({ success: false, message: "Failed to update staff profile" });
      }
    } else {
      res
        .status(400)
        .json({ success: false, message: "Failed to update admin profile" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// change admin password
exports.changeAdminpassword = async function (req, res) {
  try {
    const { DateTime } = require("luxon");
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const password = req.body.password;
    const newpassword = req.body.newpassword;
    const confirmpassword = req.body.confirmpassword;

    if (password == null || password == "" || password == undefined) {
      res
        .status(400)
        .json({ success: false, message: "Please enter current password" });
    }
    const userPass = await Admin.findOne({ _id: req.userId }, { password: 1 });
    let currentPassVal = bcrypt.compareSync(password, userPass.password);
    if (currentPassVal == true) {
      if (newpassword === confirmpassword) {
        const bcryptedpassword = bcrypt.hashSync(confirmpassword, 10);
        await Admin.updateOne(
          { _id: req.userId },
          {
            $set: {
              password: bcryptedpassword,
              logModifiedDate: logDate,
            },
          },
          {
            new: true,
          }
        );
        return res
          .status(200)
          .json({ success: true, message: "Password updated successfully" });
      } else {
        res
          .status(400)
          .json({ success: false, message: "New password does not match" });
      }
    } else {
      res.status(400).json({ success: false, message: "Invalid Old Password" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

/********************************* || FORGOT PASSWORD || ****************************************/
// generate otp
// exports.generateOtp = async function (req, res) {
//   const user = await Admin.findOne({ email: req.body.email });
//   if (user) {
//     let num = "1234567890";
//     let otp = "";
//     let onetimePassword;
//     let senderEmail = req.body.email;

//     for (let i = 0; i <= 6; i++) {
//       otp = otp + num[Math.floor(Math.random() * 10)];
//     }
//     onetimePassword = otp;
//     const otpObj = new otpModel({
//       otp: onetimePassword,
//       emailId: senderEmail,
//       userId: user._id,
//     });
//     const otpSave = otpObj.save();

//     if (otpSave) {
//       const userData = await Admin.findOne(
//         { email: senderEmail },
//         { _id: 1, email: 1 }
//       );
//       let userInfo = userData._id;

//       // template engine for forgot password
//       const emailData = {
//         name: userData.name,
//         email: userData.email,
//         otp: onetimePassword,
//       };

//       // require("../../views/otpEmail.ejs")
//       const emailTemplatePath = path.join(
//         __dirname,
//         "../../views/otpEmail.ejs"
//       );
//       console.log(
//         "Email template path-------------------------------------:",
//         emailTemplatePath
//       ); // Debugging log

//       const emailTemplateFile = fs.readFileSync(emailTemplatePath, "utf-8");

//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         host: "smptp.gmail.com",
//         port: "5013",
//         auth: {
//           user: "shivaprasad.etika@gmail.com",
//           pass: "kxexyyesdwqrwhdh",
//         },
//         secureconnection: "false",
//         tls: {
//           ciphers: "SSLv3",
//           rejectUnauthorized: false,
//         },
//       });
//       console.log(senderEmail);
//       let mailOptions = {
//         from: "shivaprasad.etika@gmail.com",
//         to: `${senderEmail}`,
//         attachements: [
//           {
//             filename: "",
//             path: "http://193.203.160.181:5013/uploads/profileImg/1705651734125-Infame.png",
//             cid: "indfame",
//           },
//         ],
//         subject: "Forgot password OTP",
//         html: ejs.render(emailTemplateFile, emailData),
//       };
//       transporter.sendMail(mailOptions, function (error, success) {
//         if (error) {
//           console.log(error);
//         }
//         if (success) {
//           console.log(success);
//         }
//       });
//       const updateOtp = await otpModel.updateOne(
//         { _id: otpObj._id },
//         {
//           $set: {
//             userId: userData._id,
//           },
//         },
//         {
//           new: true,
//         }
//       );
//       return res.status(200).json({
//         success: true,
//         message: "Otp has been sent successfully to specified email",
//         userInfo: userInfo,
//       });
//     }
//   } else {
//     return res.status(400).json({
//       success: false,
//       message: "User is not registered with this email",
//     });
//   }
// };

exports.generateOtp = async function (req, res) {
  try {
    const user = await Admin.findOne({ email: req.body.email });
    if (user) {
      let otp = "";
      let num = "1234567890";
      for (let i = 0; i < 6; i++) {
        // Adjusted to 6 iterations for a 6-digit OTP
        otp += num[Math.floor(Math.random() * 10)];
      }

      const otpObj = new otpModel({
        Otp: otp,
        emailId: req.body.email,
        userId: user._id,
      });

      await otpObj.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "shivaprasad.etika@gmail.com",
          pass: "kxexyyesdwqrwhdh", // Replace with environment variable for security
        },
      });

      const mailOptions = {
        from: "shivaprasad.etika@gmail.com",
        to: req.body.email,
        subject: "Forgot Password OTP",
        text: `Hello ${user.name},\n\nYour OTP for password reset is: ${otp}\n\nThank you.`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          return res.status(500).json({
            success: false,
            message: "Error sending OTP email",
          });
        } else {
          console.log("Email sent: " + info.response);
          return res.status(200).json({
            success: true,
            message: "OTP has been sent successfully to the specified email",
            userInfo: user._id,
          });
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "User is not registered with this email",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// compare otp
exports.compareOtp = async function (req, res) {
  try {
    const otpResult = await otpModel
      .findOne({ userId: req.body._id })
      .sort({ createdAt: -1 });

    if (!otpResult) {
      return res
        .status(400)
        .json({ success: false, message: "No OTP found for this user" });
    }

    if (req.body.emailOtp === otpResult.Otp) {
      return res
        .status(200)
        .json({ success: true, message: "Otp has been verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid Otp" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// reset password
exports.resetpassword = async function (req, res) {
  try {
    const { DateTime } = require("luxon");
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    const showEmail = await otpModel.findOne({ userId: req.body.userId });
    console.log(showEmail);
    if (showEmail) {
      const { newpassword, confirmpassword } = req.body;
      if (newpassword === confirmpassword) {
        let bcryptedpassword = bcrypt.hashSync(confirmpassword, 10);

        const showUser = await Admin.updateOne(
          { _id: req.body.userId },
          {
            $set: {
              password: bcryptedpassword,
              logModifiedDate: logDate,
            },
          },
          {
            new: true,
          }
        );
        const transporter = nodemailer.createTransport({
          service: "gmail",
          host: "smtp.gmail.com",
          port: "5012",
          auth: {
            user: "shivaprasad.etika@gmail.com",
            pass: "kxexyyesdwqrwhdh",
          },
          secureconnection: "false",
          tls: {
            ciphers: "SSLv3",
            rejectUnauthorized: "false",
          },
        });
        let mailOptions = {
          from: "shivaprasad.etika@gmail.com",
          to: `${showEmail.emailId}`,
          subject: "Reset password",
          html: `<p style="color : Black; font-size: 15px">Hi There, <br> You have successfully reset your password.</p>`,
        };
        transporter.sendMail(mailOptions, function (error, success) {
          if (error) {
            console.log(error);
          }
          if (success) {
            console.log("Email sent successfully");
          }
        });
        return res.status(200).json({
          message:
            "The password has reset successfully.Please login with your new password",
        });
      } else {
        return res.status(400).json({ message: "Invalid password" });
      }
    } else {
      return res.status(400).json({ message: "Invalid  User Data" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
