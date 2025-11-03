const mongoose=require('mongoose')
const locationSchema=new mongoose.Schema({
    name: {type:String, trim:true,required:true, unique:true},
    image: {type:String, trim:true}

},{timestamps:true})

module.exports=mongoose.model("location",locationSchema)