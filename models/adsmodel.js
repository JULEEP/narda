const mongoose = require("mongoose");
const articleSchema = new mongoose.Schema(
  {
    title: {
    type: String, 
    trim: true 
    },
     image: {
      type: [String],  // This will now store an array of strings (paths to images)
    },
    description: {
      type: String,
    },
    type: {
        type: String,
        enum: ["news", "articles",'posters',"videos"]
    },
    url: {
      type: String,
    },
    expiryDate: {
      type:String
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
     userType: {
      type: String,
    },
     showAfterPosters: {
      type: Number,
      default: 1,
      min: 1,
      max: 50
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true 
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ads", articleSchema);
