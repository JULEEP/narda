const mongoose=require('mongoose')
const policies=new mongoose.Schema({
 logcreatedAt:{type:Date},
 logUpdatedAt:{type:Date},
 privacypolicy:{type:String},
 aboutUs:{type:String},
 contactUs:{type:Object},
 termsAndConditions:{type:String},
 type:{type:String}
},{timestamps:true})


module.exports=mongoose.model("policies", policies)