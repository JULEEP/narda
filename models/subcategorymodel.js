const mongoose=require('mongoose')
const subcategorySchema=new mongoose.Schema({
    categoryId:{type:String},
    categoryName:{type:String},
    name: {type:String, trim:true,required:true, unique:true},
    image: {type:String, trim:true}

},{timestamps:true})

module.exports=mongoose.model("subcategory",subcategorySchema)