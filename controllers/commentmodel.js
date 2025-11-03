const mongoose=require('mongoose')
const commentSchema=new mongoose.Schema({
  name:{type:String},
  contentId:{type:String},
  comment:{type:String},
  commentedAt:{type:Date, default: Date.now()},
  userId:{type:String},
  user:{type:String
  
  },
  type:{String}
},{timestamps:true})

module.exports=mongoose.model("comment", commentSchema)