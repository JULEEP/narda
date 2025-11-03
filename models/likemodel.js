const mongoose=require('mongoose')
const likeSchema=new mongoose.Schema({
  name:{type:String},
  contentId:{type:String},
  likedAt:{type:Date, default: Date.now()},
  type:{type:String},
  userId:{type:String}

},{timestamps:true})

module.exports=mongoose.model("like", likeSchema)