const mongoose=require('mongoose')
const adImageSchema=new mongoose.Schema({
  image:{type:String, trim:true},
  video:{type:String, trim:true},
  createdBy:{type:String},
  expirydate:{type:Date},
  adImageId:{type:String},
  status:{type:String, enum:["active", "inactive"], default:"active"},

},{timestamps:true})

module.exports=mongoose.model("adImage", adImageSchema)