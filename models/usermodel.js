const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({

  name: {type:String, trim:true},
  phone: {type:String,trim:true},
  email: {type:String, trim:true},
  city:{type:String,  trim:true},
  password:{type:String, trim:true},
  profilepic:{type:String}, 
  state:{type:String},
  otp: {type:String},
  status:{type:String, default:"inactive"},
  isBlocked:{
    type: Boolean,
    default: false 
  },
  terms:{type:Boolean}, 
  language:{type:String},
  bookmarks:{type:Array},
  apptoken:{type:String, trim:true},
  categories:{type:Array},
  locations:{type: Array},
  fcm_token:{type: String},
   subscribedUser: { type: Boolean, default: false },
    planExpiryDate: { type: Date, default: null }
  

},{timestamps:true})

module.exports=mongoose.model("admin",userSchema)