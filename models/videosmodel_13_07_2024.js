const mongoose=require('mongoose')
const videoSchema=new mongoose.Schema({

  title: {type:String, trim:true},
  video:{type:String, trim:true},
  description:{type:String},
  createdBy: {type:String, trim:true},
  size:{type:String, trim:true},
  likes: {type:Number, default:0},
  comments: {type:Number, default:0},
  views:{type:Number, default:0},
  reporter: {type:String},
  category: {type:Array},
  subcategory: {type:String},
  language: {type:String},
  isPaid: {type:String},
  isDownload: {type:String},
  visible:{type:String},
  status:{type:String},
  tags:{type:Array},
  expirydate:{type:Date},
  videoId:{type:String},
  topnews: {type:Boolean , default:false},
  bookmark:{type:Boolean, default:false},
  postedAt:{type:Date},
  isPremium:{type:Boolean, default:true},
  draft:{type:Boolean},
  banner:{type:String},
  timetoread:{type:String},
  location:{type:Array}
},{timestamps:true})

module.exports=mongoose.model("videos", videoSchema)