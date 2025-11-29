const paymentmodel = require("../models/paymentmodel");
const subscribemodel = require("../models/subsciptionmodel");
const usermodel = require("../models/usermodel");

const createsubscription = async function (req, res) {
  try {
    console.log("Request Body:", req.body);

    // Directly get all fields from req.body
    const { planName, duration, price, discount, order, advantages } = req.body;

    // Create object with all fields
    const subscriptionData = {
      planName: planName,
      duration: duration,
      price: price,
      discount: discount,
      order: order,
      status: "active"
    };

    // Handle advantages
    if (advantages) {
      try {
        subscriptionData.advantages = JSON.parse(advantages);
        console.log("Parsed advantages:", subscriptionData.advantages);
      } catch (error) {
        console.log("JSON parse error:", error);
        subscriptionData.advantages = [advantages];
      }
    } else {
      subscriptionData.advantages = [];
    }

    console.log("Final data to save:", subscriptionData);

    // Create in database
    const createdPlan = await subscribemodel.create(subscriptionData);

    return res.status(200).send({
      status: true,
      message: "Plan created successfully",
      data: createdPlan,
    });

  } catch (err) {
    console.log("Error:", err);
    return res.status(500).send({ 
      status: false, 
      message: "Something went wrong" 
    });
  }
};


// get all plans
const getAlladminplans = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      condition = {
        $or: [{ planName: regex }],
      };
    }
    console.log(condition);
    const plans = await subscribemodel.find(condition).sort({
      createdAt: -1,
    });
    if (plans) {
      res.status(200).json({
        success: true,
        message: "Plans have been retrived successfully",
        plans: plans,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

// edit subscription
const editsubscription = async function (req, res) {
  try {
    console.log("Edit Request Body:", req.body);

    // Directly get all fields from req.body
    const { planName, duration, price, discount, order, advantages } = req.body;

    // Create object with all fields
    const updateData = {
      planName: planName,
      duration: duration,
      price: price,
      discount: discount,
      order: order
    };

    // Handle advantages
    if (advantages) {
      try {
        updateData.advantages = JSON.parse(advantages);
        console.log("Parsed advantages:", updateData.advantages);
      } catch (error) {
        console.log("JSON parse error:", error);
        updateData.advantages = [advantages];
      }
    } else {
      updateData.advantages = [];
    }

    console.log("Final data to update:", updateData);

    // Update in database
    const updatedPlan = await subscribemodel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (updatedPlan) {
      return res.status(200).send({
        status: true,
        message: "Plan updated successfully",
        data: updatedPlan,
      });
    } else {
      return res.status(400).send({
        status: false,
        message: "Plan not found",
      });
    }

  } catch (err) {
    console.log("Error:", err);
    return res.status(500).send({ 
      status: false, 
      message: "Something went wrong" 
    });
  }
};
// delete subscription

const deletesubscription = async function (req, res) {
  try {
    const category = await subscribemodel.findOneAndDelete({
      _id: req.params.id,
    });
    if (category) {
      res.status(200).json({ success: true, message: "Deleted successfullly" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong" });
  }
};

function formatDateTime(dateStr) {
  try {
    const date = new Date(dateStr);
    const convertedDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const formattedDate = convertedDate.toLocaleString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return formattedDate;
  } catch (error) {
    console.error("Error in formatDateTime:", error.message);
    return dateStr; // Return the original date string in case of error
  }
}

const getallplans = async function (req, res) {
  try {
    let obj = {};
    let customerId = req.decoded.id;

    let plans = await subscribemodel.find();

    // ❌ Remove popup plans
    plans = plans.filter(plan => !plan.popupImg);

    // ❌ Remove image from response and sort by 'order'
    plans = plans
      .map(plan => {
        const { image, popupImg, ...rest } = plan.toObject();
        return rest;
      })
      .sort((a, b) => a.order - b.order);

    let issubscribed = await paymentmodel
      .findOne({ customerId: customerId })
      .sort({ createdAt: -1 });

    if (issubscribed) {
      let subscribedData = {
        expiryDate: formatDateTime(issubscribed.expirydate),
        price: issubscribed.price,
        planName: issubscribed.planName,
      };
      obj.subscribedData = subscribedData;
    } else {
      obj.subscribedData = {};
    }

    obj.plans = plans;

    if (plans.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "NO plan available" });

    return res.status(200).send({
      status: true,
      message: "all plans fetched successfully",
      data: obj,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ status: false, message: "Unable to get plans data" });
  }
};

const getallpayments = async function (req, res) {
  try {
    let condition = {};
    let regex = new RegExp(req.query.searchQuery, "i");
    if (req.query.searchQuery !== "") {
      // condition = {
      //   $or: [{ transactionId: regex },{planName:regex}],
      // };
    }
    console.log(req.query.searchQuery,"req.params.searchQuery");
    let paymetns = await paymentmodel.find(condition).sort({_id: -1});

    let paymentsdata = await Promise.all(
      paymetns.map(async (payment) => {
        let c={};
        c._id=payment.customerId;

        if (req.query.searchQuery) {
          c.name = { $regex: req.query.searchQuery, $options: 'i' }; // Assuming you want a case-insensitive regex search
        }
        console.log(c);
        let customer = await usermodel.findOne(c);
        if(customer)
        {
          return {
            ...payment.toObject(),
            customer: customer ? customer.name : ""
          };
        }
        else
        {
          return null;
        }
      })
    );

    paymentsdata = paymentsdata.filter(payment => payment !== null);


    return res.status(200).send({
      status: true,
      message: "all Payments fetched successfully",
      data: paymentsdata,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ status: false, message: "Unable to get plans data" });
  }
};


const createSubscriptionPopup = async function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "popupImg is required",
      });
    }

    const newSubscription = new subscribemodel({
      popupImg: req.file.path, 
      status: "active",
    });

    const saved = await newSubscription.save();

    return res.status(201).json({
      success: true,
      message: "Subscription popup created successfully",
      data: saved,
    });
  } catch (err) {
    console.error("Error creating subscription popup:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



// Get all subscription popups (only docs having popupImg)
const getAllSubscriptionPopups = async (req, res) => {
  try {
    const subscriptions = await subscribemodel
      .find({ popupImg: { $exists: true, $ne: "" } }) // only docs having popupImg
      .select("_id popupImg"); // include only _id and popupImg

    return res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (err) {
    console.error("Error fetching subscription popups:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



const deleteSubscriptionPopup = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await SubscriptionModel.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Popup not found" })
    }
    return res.status(200).json({ success: true, message: "Popup deleted successfully" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: "Something went wrong" })
  }
}

module.exports.createsubscription = createsubscription;
module.exports.getAlladminplans = getAlladminplans;
module.exports.editsubscription = editsubscription;
module.exports.deletesubscription = deletesubscription;
module.exports.getallplans = getallplans;
module.exports.getallpayments = getallpayments;
module.exports.subscriptionPopup = createSubscriptionPopup;
module.exports.getsubscriptionPopup = getAllSubscriptionPopups;
module.exports.deletesubscriptionPopup = deleteSubscriptionPopup;



