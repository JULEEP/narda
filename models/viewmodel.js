const mongoose=require('mongoose')
const viewSchema=new mongoose.Schema({
  name:{type:String},
  contentId:{type:String},
  viewedAt:{type:Date, default: Date.now()},
  type:{type:String},
  userId:{type:String}

},{timestamps:true})

module.exports=mongoose.model("view", viewSchema)