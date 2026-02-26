const usermodel = require("../models/usermodel")
const brcyptjs = require('bcrypt')
const validator= require("../validators/validators")
const mongoose = require("mongoose");
const paymentModel= require("../models/paymentmodel")
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const getallusers = async function (req, res) {
    try {
        console.log("dataa")
        const users = await usermodel.find()
        console.log(users)
        if(users.length) return res.status(200).send({status:true, message:users})
        return res.status(400).send({status:false, message:"users not found"})


    } catch (err) {
        return res.status(400).send({status:false, message:"users not found"})
    }
}


const getuser = async function (req, res) {
  try {
    const id = req.decoded.id;

    const userpaid = await paymentModel
      .findOne({ customerId: new mongoose.Types.ObjectId(id) })
      .sort({ _id: -1 })
      .limit(1);

    const users = await usermodel.findOne({
      _id: new mongoose.Types.ObjectId(req.decoded.id),
    });

    if (users) {
      await usermodel.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { fcm_token: req.body.fcm_token },
        { new: true }
      );

      // ✅ Default image URL here
      const defaultImage =
        "https://th.bing.com/th/id/OIP.HiaEyZc2MvcfEAwP-IJ5pgHaHa?w=209&h=209&c=7&r=0&o=7&cb=ucfimgc2&dpr=1.8&pid=1.7&rm=3";

      const obj = {
        userId: users._id,
        name: users.name,
        email: users.email,
        image: users.profilepic ? users.profilepic : defaultImage, // ✅ changed line
        phone: users.phone,
        city: users.city,
        state: users.state,
        address: `${users.state}, ${users.city}`,
        bookmark: users.bookmarks,
        isBlocked: users.isBlocked,
        isSubscribedUser: users.subscribedUser,
        planExpiryDate: users.planExpiryDate,
      };

      if (userpaid && userpaid.expirydate > Date.now()) {
        obj.isPaid = true;
      } else {
        obj.isPaid = false;
      }

      return res
        .status(200)
        .send({ status: true, data: obj, message: "User found successfully" });
    }

    return res
      .status(400)
      .send({ status: false, message: "User not found" });
  } catch (err) {
    console.error("Get User Error:", err);
    return res.status(400).send({ status: false, message: err.message });
  }
};




const addusers = async (req, res) => {
    try {
        console.log(req.body, "bodyyy")

        if (!validator.validateName(req.body.name.trim())) {
            return res.status(400).send({ status: false, message: "Enter a valid First name" });
        }
        if (!validator.validateEmail(req.body.email.trim())) {
            return res.status(400).send({ status: false, message: "Enter a valid Email" })
        }

        if (!validator.validateMobileNo(req.body.phone.trim())) {
            return res.status(400).send({ status: false, message: "Enter a Valid Mobile Number" })
        }
        const userdata = await usermodel.findOne({ email: req.body.email })
        if (userdata) {
            return res.status(400).send({ status: false, message: 'user with email already exists' })
        }
        let password = await brcyptjs.hash(req.body.password, 10)
        req.body.password = password
        if (req.file) {
            let file = req.file
            req.body.profileimg = file.path

        }
        let user = await usermodel.create(req.body)
        if (user) {
            return res.status(200).send({ status: true, message: "user addded sucesfully" })

        } else {
            return res.status(400).send({ status: false, message: "Unable to add user" })
        }

    } catch (err) {
        return res.status(400).send({ message: err.message })
    }
}

const editusers = async function (req, res) {
    try {
        console.log(req.body)
        if(req.Files) {
            let file= req.Files[0]

        }
        let updateuser = await usermodel.findByIdAndUpdate({ _id: req.body.id }, { ...req.body }, { new: true })
        if (updateuser == null) {
            return res.status(400).send({ status: false, message: "unable to update user" })
        }

        return res.status(200).send({ status: true, message: "user updated successfully" })

    } catch (err) {
        return res.status(400).send({ message: err.message })
    }
}

const removeUser = async (req, res) => {
    try {
        let id = req.params.id
        const deleteuser = await usermodel.deleteOne({ _id: id })
        if (!deleteuser) {
            return res.status(400).send({ status: false, message: "unable to remove user" })
        }
        return res.status(200).send({ status: true, message: "user deleted successfully" })

    } catch (err) {
        return res.status(400).send({ message: err.message })

    }

}
const blockUser = async (req, res) => {
    try {
        let id = req.body.id;
        console.log(req.body);
        const deleteuser = await usermodel.updateOne({ _id: new mongoose.Types.ObjectId(id) },{ isBlocked:req.body.block }, { new: true });

        if (deleteuser) {
            var msg="";
            msg=(req.body.block)?"User Blocked successfully":"User UnBlocked successfully";
            return res.status(200).send({ status: true, message:msg })
        }
       // return res.status(200).send({ status: true, message: "user deleted successfully" })

    } catch (err) {
        return res.status(400).send({ message: err.message })

    }

}

const searchuser = async (req, res) => {
    try {
        let userkey = req.body.username
        console.log(userkey)
        let users = await usermodel.find({ name: { $regex: userkey } }).select({ __v: 0 });
        console.log(users)
        if (users) {
            return res.status(200).json({ status: true, data: users });
        }
    } catch (err) {
        return res.status(404).send({ message: err.message })
    }

}


const addcategory= async function(req,res){
    try{
        console.log(req.decoded.id, "userIddd")
        let catgeories= req.body.category;

        const catgeorieslist = catgeories.map(loca => new mongoose.Types.ObjectId(loca));


        let updatecategories= await usermodel.findOneAndUpdate({_id: req.decoded.id}, {categories: catgeorieslist}, {new:true})
        console.log(updatecategories, "dhhaj")
        if(! updatecategories) return res.status(404).send({status:false, message:"unable to update Categories"})
        return res.status(200).send({status: true, message:"Category updated successfully", data:updatecategories})
    
    }catch(err){
        console.log(err.message)
        return res.status(404).send({status:false, message:"unable to update Categories"})
    }
}

const addlocations= async function(req,res){
    try{
        console.log(req.decoded.id, "userIddd")
        let location= req.body.locations;

        console.log(location,"location");

        const locations = location.map(loca => new mongoose.Types.ObjectId(loca));

        console.log(locations,"locations");

        let updatelocations= await usermodel.findOneAndUpdate({_id: req.decoded.id}, { locations: locations}, {new:true})
    
        if(! updatelocations) return res.status(404).send({status:false, message:"unable to update locations"})
        return res.status(200).send({status: true, message:"locations updated successfully", data:updatelocations})
    
    }catch(err){
        console.log(err.message)
        return res.status(404).send({status:false, message:"unable to update locations"})
    }
}



const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId; // ✅ userId from params

    const deletedUser = await usermodel.deleteOne({ _id: userId });

    if (!deletedUser || deletedUser.deletedCount === 0) {
      return res
        .status(400)
        .send({ status: false, message: "Unable to delete user" });
    }

    return res
      .status(200)
      .send({ status: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete User Error:", err);
    return res.status(500).send({ status: false, message: err.message });
  }
};




// Setup Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pms226803@gmail.com',
    pass: 'nrasbifqxsxzurrm',
  },
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000
});

const deleteAccount = async (req, res) => {
  const { email, reason } = req.body;

  console.log(`📩 Delete request received from email: ${email}, reason: ${reason}`);

  if (!email || !reason) {
    console.log("❌ Missing email or reason in request body");
    return res.status(400).json({ message: 'Email and reason are required' });
  }

  try {
    const user = await usermodel.findOne({ email });

    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      return res.status(404).json({ message: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const deleteLink = `${process.env.BASE_URL}/confirm-delete-account/${token}`;

    user.deleteToken = token;
    user.deleteTokenExpiration = Date.now() + 3600000; // 1 hour

    console.log("📝 User before saving:", user);

    await user.save();

    console.log("💾 User after saving:", user);

    const mailOptions = {
      from: 'pms226803@gmail.com',
      to: email,
      subject: 'Account Deletion Request Received',
      text: `Hi ${user.name},\n\nWe received your account deletion request. 
To confirm deletion, click below:\n\n${deleteLink}\n\nReason: ${reason}\n\nRegards,\nYour Team`,
    };

    await transporter.sendMail(mailOptions);

    const responsePayload = {
      message: 'Account deletion request processed. Check your email for confirmation.',
      requestedBy: email,
      token: token
    };

    console.log("📤 Response sent to client:", responsePayload);

    return res.status(200).json(responsePayload);

  } catch (err) {
    console.error("🔥 Error in deleteAccount:", err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

const confirmDeleteAccount = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      deleteToken: token,
      deleteTokenExpiration: { $gt: Date.now() },
    });

    if (user) {
      await usermodel.deleteOne({ _id: user._id });
    }

    return res.status(200).json({
      message: 'Your account has been successfully deleted.',
    });
  } catch (err) {
    console.error('Error in confirmDeleteAccount:', err);
    return res.status(200).json({
      message: 'Your account has been successfully deleted.',
    });
  }
};


module.exports.getallusers = getallusers
module.exports.addusers = addusers
module.exports.editusers = editusers
module.exports.removeUser = removeUser
module.exports.searchuser = searchuser
module.exports.getuser = getuser
module.exports.addcategory=addcategory
module.exports.addlocations= addlocations
module.exports.blockUser= blockUser
module.exports.deleteUser = deleteUser
module.exports.deleteAccount = deleteAccount
module.exports.confirmDeleteAccount = confirmDeleteAccount

