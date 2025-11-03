const mongoose = require("mongoose");
const payment = new mongoose.Schema({
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  planName:{
    type:String
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId
  },
 
  price: {
    type: String
  },
  
  date: {
    type: String
  },
  logDateCreated: {
    type: String
  },
  logDateModified: {
    type: String
  },
  status: {
    type: String,
    enum: [
      "pending",
      "completed",

    ],
    default: "pending"
  },
  transactionId: {
    type: String
  },
  expirydate:{
    type:Date
  }
},{timestamps:true});

module.exports = mongoose.model("payment", payment);
