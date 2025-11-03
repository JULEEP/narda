const adimagemodel = require("../models/adimagemodel");
const adImagemodel= require("../models/adimagemodel")

const createadimage= async function(req, res){
    try {
        console.log(req.body)
        const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        let files = req.files
        let picture = files[0].path
        req.body.createdBy = req.decoded.email
        req.body.adImageId= "naradImg"+randomNumber
        req.body.image= picture
        let crateddata = await adImagemodel.create(req.body)
        if (crateddata) return res.status(200).send(crateddata)
     } catch (err) {
        return res.status(404).send({ message: err.message })
     }
}


const createadvideo= async function(req, res){
    try {
        console.log(req.body)
        const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        let files = req.files
        let picture = files[0].path
        req.body.createdBy = req.decoded.email
        req.body.adImageId= "naradImg"+randomNumber
        req.body.video= picture
        let crateddata = await adImagemodel.create(req.body)
        if (crateddata) return res.status(200).send(crateddata)
     } catch (err) {
        return res.status(404).send({ message: err.message })
     }
}

const getadimage= async (req, res) => {
    try{
        const adImage= await adimagemodel.findById({_id: req.query.id})
        if(adImage) return res.status(200).send({ status:true, message: adImage})
        return res.status(404).send({ status:false, message: 'Not found'})
    }catch(err){
        return res.status(404).send({ message: err.message })
    }
}

const getalladImages= async (req, res) => {
    try{
        const adImages= await adimagemodel.find()
        if(adImages) return res.status(200).send ({ status:true, message:adImages})
        return res.status(404).send({ status:false, message:"not found"})    

    }catch(err){
        return res.status(500).send({ status:false, message:err.message})
    }
}

const getalllikes= async function(req,res){
    try{
        let poster= await adImagemodel.find({createdBy: req.decoded.email})
        if(poster){
            // console.log(poster)
            let likes=0
            let comments=0
            let views=0
            for(let i=0;i<poster.length;i++){
                //console.log(poster[i].likes)
                likes+=poster[i].likes
                comments+=poster[i].comments
                views+= poster[i].views
            }
            return res.status(200).send({message: {likes:likes, comments:comments, views:views}})
        }
        return res.status(404).send({message:"not found"})

    }catch(err){
        return res.status(500).send({message:err.message})

    }
}
  const updateExpiredAdds = async () => {
  const expiryDate = new Date();
  expiryDate.setHours(0, 0, 0, 0); 
  const expiredimageAdds = await adImagemodel.updateMany(
    {
      expiryDate: { $lte: expiryDate }
    },
    { $set: { status: "inactive" } }
  );
  }


// Run the function daily at midnight
const schedule = require('node-schedule');
schedule.scheduleJob('*/10 * * * * *', updateExpiredAdds);
   


module.exports.createadimage = createadimage
module.exports.getadimage=getadimage
module.exports.getalladImages=getalladImages
module.exports.getalllikes=getalllikes
module.exports.createadvideo = createadvideo

