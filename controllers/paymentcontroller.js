const paymentmodel= require("../models/paymentmodel")
const planmodel= require("../models/subsciptionmodel")
const usermodel = require("../models/usermodel")


function formatDateTime(dateStr) {
    try {
        const date = new Date(dateStr);
        const convertedDate = new Date(date.toLocaleString('en-US', { timeZone: "Asia/Kolkata" }));
        const formattedDate = convertedDate.toLocaleString('en-US', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        return formattedDate;
    } catch (error) {
        console.error('Error in formatDateTime:', error.message);
        return dateStr; // Return the original date string in case of error
    }
}



async function createPayment(req, res) {
    try {
        // Customer ID from token
        const customerId = req.decoded.id;

        // Body parameters
        const { orderid, planId } = req.body;

        if (!orderid || !planId) {
            return res.status(400).json({ status: false, message: "Order ID and Plan ID are required" });
        }

        // Find user
        const user = await usermodel.findById(customerId);
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        // Find plan
        const plandetails = await planmodel.findById(planId);
        if (!plandetails) {
            return res.status(404).json({ status: false, message: "Plan not found" });
        }

        // Calculate expiry date
        const today = new Date();
        const expirydate = new Date(today);
        expirydate.setDate(expirydate.getDate() + plandetails.duration * 30);

        // Create payment object
        const paymentObj = {
            planId: planId,
            planName: plandetails.planName,
            customerId: customerId,
            price: plandetails.price,
            logDateCreated: today,
            logDateModified: today,
            status: "completed",
            transactionId: orderid,
            expirydate: expirydate
        };

        // Save payment
        const createOrder = await paymentmodel.create(paymentObj);

        // Update user subscription
        user.subscribedUser = true;
        user.planExpiryDate = expirydate;
        await user.save();

        // Format expiry date for response
        const dateformat = formatDateTime(createOrder.expirydate);

        return res.status(200).json({
            status: true,
            data: createOrder,
            expirydate: dateformat,
            message: "Subscribed Successfully"
        });

    } catch (err) {
        console.error("Payment creation error:", err.message);
        return res.status(500).json({ status: false, message: "Unable to add Payment" });
    }
}




module.exports.createPayment= createPayment