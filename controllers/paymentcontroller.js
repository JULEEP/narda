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



// CommonJS export
exports.payWithApple = async function (req, res) {
    try {
        // Customer ID from token
        const customerId = req.decoded.id;

        // Body parameters
        const { planId, receiptData, productId } = req.body;

        if (!planId) {
            return res.status(400).json({
                status: false,
                message: "Plan ID is required"
            });
        }

        // Debug logs
        console.log("📥 Apple Pay Request:", req.body);
        console.log("🔍 Receipt Data (first 100 chars):", receiptData ? receiptData.substring(0, 100) : "NO RECEIPT PROVIDED");

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

        // Save productId into plan if not saved before
        if (productId && !plandetails.appleProductId) {
            plandetails.appleProductId = productId;
            await plandetails.save();
            console.log("📦 Saved Apple Product ID to plan:", productId);
        }

        // Calculate expiry date
        const today = new Date();
        const expirydate = new Date(today);
        expirydate.setDate(expirydate.getDate() + plandetails.duration * 30);

        // Create Apple Pay payment object
        const paymentObj = {
            planId: planId,
            planName: plandetails.planName,
            customerId: customerId,
            price: plandetails.price,
            logDateCreated: today,
            logDateModified: today,
            status: "completed",
            expirydate: expirydate,

            // EXTRA FIELDS FOR APPLE
            receiptData: receiptData || null,
            productId: productId || null,
            paymentMethod: "apple_pay"
        };

        // Save payment
        const savedPayment = await paymentmodel.create(paymentObj);

        // Update user subscription
        user.subscribedUser = true;
        user.planExpiryDate = expirydate;
        await user.save();

        // Format expiry date
        const dateformat = formatDateTime(savedPayment.expirydate);

        return res.status(200).json({
            status: true,
            data: savedPayment,
            expirydate: dateformat,
            message: "Apple Pay Subscription Activated Successfully"
        });

    } catch (err) {
        console.error("Apple Pay error:", err.message);
        return res.status(500).json({
            status: false,
            message: "Unable to process Apple Pay",
            error: err.message
        });
    }
};

// Apple Webhook handler
exports.handleAppleWebhook = async function (req, res) {
    try {
        const notification = req.body;

        console.log("📩 Apple Webhook received:", notification.notification_type);

        const latest = notification.unified_receipt?.latest_receipt_info?.[0];
        if (!latest) {
            return res.status(400).send("Invalid payload");
        }

        const productId = latest.product_id;
        const userId = latest.app_account_token; // userId sent from iOS
        const expiresDate = new Date(parseInt(latest.expires_date_ms));

        if (!userId) return res.status(200).send("No userId in webhook");

        const user = await usermodel.findById(userId);
        if (!user) return res.status(200).send("User not found");

        // Find plan by Apple productId
        const plan = await planmodel.findOne({ appleProductId: productId });
        if (!plan) return res.status(200).send("Plan not found");

        // Find subscription for this plan in user
        const index = user.subscribedPlans.findIndex(
            (p) => p.planId.toString() === plan._id.toString()
        );

        if (index === -1) return res.status(200).send("Plan not found for user");

        switch (notification.notification_type) {
            case "DID_RENEW":
            case "RENEWAL":
            case "INTERACTIVE_RENEWAL":
                user.subscribedPlans[index].endDate = expiresDate;
                user.subscribedPlans[index].isPurchasedPlan = true;
                break;

            case "DID_FAIL_TO_RENEW":
            case "BILLING_RETRY":
            case "CANCEL":
            case "REFUND":
            case "EXPIRED":
                user.subscribedPlans[index].isPurchasedPlan = false;
                break;

            default:
                console.log("Unhandled notification type:", notification.notification_type);
        }

        await user.save();
        console.log("✅ User subscription updated via Apple Webhook");

        return res.status(200).send("OK");

    } catch (err) {
        console.error("❌ Apple Webhook error:", err);
        return res.status(500).send("Error");
    }
};



module.exports.createPayment= createPayment