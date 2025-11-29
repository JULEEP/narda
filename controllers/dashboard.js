const postermodel = require("../models/postermodel")
const likemodel = require("../models/likemodel")
const reportermodel = require("../models/reportermodel")
const commentmodel = require("../models/commentmodel")
const usermodel = require("../models/usermodel")
const articlemodel = require("../models/articlemodel")
const newsmoddel = require("../models/newsmodel")
const videomodel = require("../models/videosmodel")
const admodel= require("../models/adimagemodel")
const newsmodel = require("../models/newsmodel")
const viewmodel= require("../models/viewmodel")
const adsmodel= require("../models/adsmodel")
const mongoose = require("mongoose");
const striptags = require('striptags');


function formatDateTime(dateStr) {
    const dateObj = new Date(dateStr);

    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const year = dateObj.getFullYear().toString().slice(-2);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';

    const formattedDay = day + (day % 10 === 1 && day !== 11 ? 'st' : (day % 10 === 2 && day !== 12 ? 'nd' : (day % 10 === 3 && day !== 13 ? 'rd' : 'th')));
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = ('0' + minutes).slice(-2);

    return `${formattedDay} of ${month} ${year}, ${formattedHours}:${formattedMinutes} ${ampm}`;
}



const getallposters = async function (req, res) {
    try {
        const count = await postermodel.find()
        if (count) return res.status(200).json({ data: count })
        return res.status(404).json({ status: false, message: "Not Found" })

    } catch (err) {
        return res.status(404).json({ status: false, message: err.message })
    }

}


const getdataforadmin= async function(req, res){
    try{
        let type= req.body.type
        let dataarray=[]
        if(type== "article"){
            let allarticles = await articlemodel.find()
            dataarray.push(allarticles)
        }else if(type=="poster"){
            let posters= await postermodel.find()
            dataarray.push(posters)
        }else if(type=="video"){
            let videos= await  videomodel.find()
            dataarray.push(videos)
        }else if(type=="news"){
            let news= await newsmodel.find()
            dataarray.push(news)
        }

        if(dataarray.length> 0) return res.status(200).send({status:true, data:dataarray, messagee:" all data fetched successfully"})
        return res.status(400).send({status:false, messagee:" data not found"})
    }catch(err){
        return res.status(400).json({status: false, message:err.message})
    }
}




const getalldata = async function (req, res) {
    try {

        let condition = {};
        let type = req.body.type
        let data
        let dataArray = []
        if (type == "article") {
            let allarticles = await articlemodel.find(condition)
            for (let i = 0; i < allarticles.length; i++) {
                const obj = {
                    id: allarticles[i]._id.toString(),
                    Image: allarticles[i].data[0].image,
                    title: allarticles[i].title,
                    description: allarticles[i].description,
                    bookmark: allarticles[i].bookmark,
                    time: allarticles[i].timetoread,
                    reporter: (allarticles[i].reporter) ? allarticles[i].reporter: "",
                    premium: allarticles[i].isPremium,
                    createdAt: formatDateTime(allarticles[i].createdAt)
                }

                dataArray.push(obj)
            }
        } else if (type === "news") {
            let allnews = await newsmoddel.find(condition)

            for (let i = 0; i < allnews.length; i++) {

                const obj = {
                    id: allnews[i]._id.toString(),
                    Image: (allnews[i].data[0].image) ? allnews[i].data[0].image : "uploads\noimage.jpg",
                    title: allnews[i].title,
                    description: (allnews[i].data[0].content) ? allnews[i].data[0].content : "",
                    bookmark: allnews[i].bookmark,
                    time: allnews[i].timetoread,
                    reporter: (allnews[i].reporter) ? allnews[i].reporter: "",
                    premium: allnews[i].isPremium,
                    createdAt: formatDateTime(allnews[i].createdAt)
                }

                dataArray.push(obj)

            }
        } else if (type == "video") {
            let videos = await videomodel.find()
            if (videos.length == 0) return res.status(400).send({ status: false, message: "no videos found" })

            for (let i = 0; i < videos.length; i++) {
                let obj = {
                    id: videos[i]._id.toString(),
                    video: videos[i].video,
                    title: videos[i].title,
                    description: videos[i].description,
                    bookmark: videos[i].bookmark,
                    views: videos[i].views,
                    likes: videos[i].likes,
                    reporter: (videos[i].reporter) ? videos[i].reporter: "",
                    comments: videos[i].comments,
                    premium: videos[i].isPremium,
                    createdAt: formatDateTime(videos[i].createdAt)


                }
                dataArray.push(obj)

            }
        } else if (type == "poster") {
            let posters = await postermodel.find()
            console.log(posters)
            if (posters.length == 0) return res.status(400).send({ status: false, message: "no posters found" })

            for (let i = 0; i < posters.length; i++) {
                let obj = {
                    id: posters[i]._id.toString(),
                    image: posters[i].image,
                    title: posters[i].title,
                    description: posters[i].description,
                    bookmark: posters[i].bookmark,
                    views: posters[i].views,
                    reporter: (posters[i].reporter) ? posters[i].reporter: "",
                    likes: posters[i].likes,
                    comments: posters[i].comments,
                    createdAt: formatDateTime(posters[i].createdAt)

                }
                dataArray.push(obj)

            }

        }

        return res.status(200).json({
            status: true,
            data: dataArray,
            message: "fetched data successfully"

        })
    } catch (err) {
        console.log(err)
        return res.status(400).json({ status: false, message: err.message })
    }

}

const getById = async function (req, res) {
  try {
    const id = req.body.id;
    const type = req.body.type;

    // Logged-in user data
    const usrdata = await usermodel.findById(req.decoded.id);
    if (!usrdata)
      return res.status(400).send({ status: false, message: "please Login" });

    // Check if user viewed
    const isviewed = await viewmodel.findOne({
      userId: req.decoded.id,
      contentId: req.body.id
    });

    // Allow Copy Logic
    const canUserCopy = (articleAllowCopy, user) => {
      const now = new Date();
      switch (articleAllowCopy) {
        case "both":
          return true;
        case "subscribed":
          return (
            user.subscribedUser === true &&
            user.planExpiryDate &&
            new Date(user.planExpiryDate) > now
          );
        case "unsubscribed":
          return user.subscribedUser === false;
        case "none":
        default:
          return false;
      }
    };

    // ----------------------------------------------------------------------
    // 📌 TYPE = ARTICLE
    // ----------------------------------------------------------------------
    if (type === "article") {
      if (isviewed == null) {
        await articlemodel.findByIdAndUpdate(
          { _id: id },
          { $inc: { views: 1 } },
          { new: true }
        );

        await viewmodel.create({
          contentId: id,
          userId: req.decoded.id
        });
      }

      let article = await articlemodel
        .findOne({ _id: new mongoose.Types.ObjectId(id) })
        .lean();

      const relatedarticles = await articlemodel.find({
        categoryId: article.categoryId
      });

      let relatedarray = [];
      for (let i = 0; i < relatedarticles.length; i++) {
        relatedarray.push({
          id: relatedarticles[i]._id.toString(),
          Image: relatedarticles[i].image[0],
          title: relatedarticles[i].title,
          description: relatedarticles[i].shortdescription,
          bookmark: relatedarticles[i].bookmark,
          time: relatedarticles[i].timetoread,
          premium: relatedarticles[i].isPremium,
          reporter: relatedarticles[i].reporter || "",
          createdAt: formatDateTime(relatedarticles[i].createdAt)
        });
      }

      const reportData = await reportermodel.findOne({
        _id: article.reporterId
      });

      article.createdEmail = reportData.email;
      article.reporter = article.reporter || "";
      article.createdAt = formatDateTime(article.createdAt);

      const output = striptags(article.allcontent);
      article.readcontent = output;

      // ⭐ ADD allowCopy
      article.allowCopy = canUserCopy(article.allowCopy, usrdata);

      return res.status(200).send({
        data: article,
        related: relatedarray
      });
    }

    // ----------------------------------------------------------------------
    // 📌 TYPE = NEWS
    // ----------------------------------------------------------------------
    else if (type === "news") {
      if (isviewed == null) {
        await newsmoddel.findByIdAndUpdate(
          { _id: id },
          { $inc: { views: 1 } },
          { new: true }
        );

        await viewmodel.create({
          contentId: id,
          userId: req.decoded.id
        });
      }

      let article = await newsmoddel
        .findOne({ _id: new mongoose.Types.ObjectId(id) })
        .lean();

      const relatedarticles = await newsmoddel.find({
        categoryId: article.categoryId
      });

      let relatedarray = [];
      for (let i = 0; i < relatedarticles.length; i++) {
        relatedarray.push({
          id: relatedarticles[i]._id.toString(),
          Image: relatedarticles[i].image[0],
          title: relatedarticles[i].title,
          description: striptags(relatedarticles[i].allcontent),
          shortdescription: striptags(relatedarticles[i].allcontent),
          bookmark: relatedarticles[i].bookmark,
          time: relatedarticles[i].timetoread,
          premium: relatedarticles[i].isPremium,
          reporter: relatedarticles[i].reporter || "",
          createdAt: formatDateTime(relatedarticles[i].createdAt)
        });
      }

      const reportData = await reportermodel.findOne({
        _id: article.reporterId
      });

      article.createdEmail = reportData.email;
      article.reporter = article.reporter || "";
      article.createdAt = formatDateTime(article.createdAt);

      const output = striptags(article.allcontent);
      article.readcontent = output;

      // ⭐ ADD allowCopy
      article.allowCopy = canUserCopy(article.allowCopy, usrdata);

      return res.status(200).send({
        data: article,
        related: relatedarray
      });
    }

    // ----------------------------------------------------------------------
    // 📌 TYPE = VIDEO
    // ----------------------------------------------------------------------
    else if (type === "video") {
      if (isviewed == null) {
        await videomodel.findByIdAndUpdate(
          { _id: id },
          { $inc: { views: 1 } },
          { new: true }
        );

        await viewmodel.create({
          contentId: id,
          userId: req.decoded.id
        });
      }

      let video = await videomodel.findById(id).lean();

      let relatedVideos = await videomodel.find({});
      let relatedarray = [];
      for (let i = 0; i < relatedVideos.length; i++) {
        relatedarray.push({
          id: relatedVideos[i]._id.toString(),
          video: relatedVideos[i].video,
          title: relatedVideos[i].title,
          description: relatedVideos[i].description,
          bookmark: relatedVideos[i].bookmark,
          time: relatedVideos[i].timetoread,
          likes: relatedVideos[i].likes,
          comments: relatedVideos[i].comments,
          reporter: relatedVideos[i].reporter || " ",
          createdAt: formatDateTime(relatedVideos[i].createdAt)
        });
      }

      video.reporter = video.reporter || "";
      video.createdAt = formatDateTime(video.createdAt);

      // ⭐ ADD allowCopy
      video.allowCopy = canUserCopy(video.allowCopy, usrdata);

      return res.status(200).send({
        status: true,
        data: video,
        related: relatedarray
      });
    }

    // ----------------------------------------------------------------------
    // 📌 TYPE = POSTER
    // ----------------------------------------------------------------------
    else if (type === "poster") {
      if (isviewed == null) {
        await postermodel.findByIdAndUpdate(
          { _id: id },
          { $inc: { views: 1 } },
          { new: true }
        );

        await viewmodel.create({
          contentId: id,
          userId: req.decoded.id
        });
      }

      let poster = await postermodel.findById(id).lean();
      let relatedposter = await postermodel.find();

      let relatedarray = [];
      for (let i = 0; i < relatedposter.length; i++) {
        relatedarray.push({
          id: relatedposter[i]._id.toString(),
          video: relatedposter[i].image,
          title: relatedposter[i].title,
          bookmark: relatedposter[i].bookmark,
          time: relatedposter[i].timetoread,
          likes: relatedposter[i].likes,
          comments: relatedposter[i].comments,
          reporter: relatedposter[i].reporter || " ",
          createdAt: formatDateTime(relatedposter[i].createdAt)
        });
      }

      poster.reporter = poster.reporter || "";
      poster.createdAt = formatDateTime(poster.createdAt);

      // ⭐ ADD allowCopy
      poster.allowCopy = canUserCopy(poster.allowCopy, usrdata);

      return res.status(200).json({
        status: true,
        data: poster,
        related: relatedarray
      });
    }

    return res.status(400).send({ status: false, message: "invalid type" });

  } catch (err) {
    console.error(err);
    return res.status(500).send({ status: false, message: err.message });
  }
};


const getlatest = async function (req, res) {
    try {
        const type = req.body.type
        let latestarray = []
        let topnews = []
        if (type === "article") {
            let allarticles = await articlemodel.find().sort({ createdAt: -1 })
            let topartciles = await articlemodel.find({ topnews: true }).sort({ createdAt: -1 })
            let adds = await adsmodel.find({type:"articles"}).sort({createdAt: -1});
            let j=0;
            for(let i = 0; i < allarticles.length; i++) {

                const obj = {
                    id: allarticles[i]._id.toString(),
                    Image: allarticles[i].image[0],
                    title: allarticles[i].title,
                    description: allarticles[i].allcontent,
                    shortdescription: striptags(allarticles[i].allcontent),
                    bookmark: allarticles[i].bookmark,
                    time: allarticles[i].timetoread,
                    reporter: (allarticles[i].reporter) ? allarticles[i].reporter: "",
                    premium: allarticles[i].isPremium,
                    createdAt: formatDateTime(allarticles[i].createdAt),
                    type:"articles",
                    url:""
                }
                    if(i%3 == 0)
                    {
                      if(j<adds.length  && adds.length>0)
                      {       
                        const addobj = {
                          id: adds[j]._id.toString(),
                          Image: adds[j].image,
                          title: adds[j].title,
                          description: adds[j].description,
                          bookmark: '',
                          time: '',
                          premium: false,
                          createdAt: formatDateTime(adds[j].createdAt),
                          type:"add",
                          url:adds[j].url,
                        };
                        latestarray.push(addobj);
                        j=j+1;
                      }
                    }
                latestarray.push(obj)
            }


            for (let i = 0; i < topartciles.length; i++) {

                const obj = {
                    id: topartciles[i]._id.toString(),
                    Image: topartciles[i].image[0],
                    title: topartciles[i].title,
                    description: topartciles[i].allcontent,
                    shortdescription: striptags(topartciles[i].allcontent),
                    bookmark: topartciles[i].bookmark,
                    time: topartciles[i].timetoread,
                    premium: topartciles[i].isPremium,
                    createdAt: formatDateTime(topartciles[i].createdAt)
                }
            
                topnews.push(obj)

            }

            if (latestarray.length > 0) return res.status(200).send({ status: true, latestnews: latestarray, topnews: topnews })
            return res.status(404).send({ status: false, message: "not found" })
        } 
        else if (type == "news") {
            let allnews = await newsmoddel.find().sort({ createdAt: -1 })
        
            let toppnews = await newsmoddel.find({ topnews: true }).sort({ createdAt: -1 })
            let adImages = await admodel.find()
   
            let adds = await adsmodel.find({type:"news"}).sort({createdAt: -1});
            let n=0;
            for (let i = 0; i < allnews.length; i++) {
                console.log(allnews[i]._id.toString(),i, "hashdf")
                const obj = {
                    
                    id: allnews[i]._id.toString(),
                    Image: (allnews[i].image[0]) ? allnews[i].image[0] : "uploads\noimage.jpg",
                    title: allnews[i].title,
                    description: (allnews[i].allcontent) ? allnews[i].allcontent : "",
                    shortdescription: striptags(allnews[i].allcontent),
                    bookmark: allnews[i].bookmark,
                    time: allnews[i].timetoread,
                    premium: allnews[i].isPremium,
                    createdAt: formatDateTime(allnews[i].createdAt)
                }
                   if(i%3 == 0)
                    {
                      if(n<=adds.length  && adds.length>0)
                      {       
                        const addobj = {
                          id: adds[n]._id.toString(),
                          Image: adds[n].image,
                          title: adds[n].title,
                          description: adds[n].description,
                          bookmark: '',
                          time: '',
                          premium: false,
                          createdAt: formatDateTime(adds[n].createdAt),
                          type:"add",
                          url:adds[n].url,
                        };
                        latestarray.push(addobj);
                        n=n+1;
                      }
                    }

                latestarray.push(obj)



            }
           
            for (let i = 0; i < toppnews.length; i++) {
                
                console.log(i, toppnews[i]._id)
                const obj = {
                    id: toppnews[i]._id,
                    Image: (toppnews[i].image[0]) ? toppnews[i].image[0] : "uploads\noimage.jpg",
                    title: toppnews[i].title,
                    description: (toppnews[i].allcontent) ? toppnews[i].allcontent : "",
                    shortdescription: striptags(toppnews[i].allcontent),
                    bookmark: toppnews[i].bookmark,
                    time: toppnews[i].timetoread,
                    premium: toppnews[i].isPremium ? toppnews[i].isPremium : false,
                    createdAt: formatDateTime(toppnews[i].createdAt)
                }
   
                topnews.push(obj);
            }
            console.log(topnews);
            if (latestarray.length > 0) return res.status(200).send({ status: true,latestnews: latestarray, topnews: topnews, banners: adImages })
            return res.status(400).send({ status: false, message: "not found" })


        } else if (type == "poster") {
            let posts = await postermodel.find().sort({ createdAt: -1 })
            let toppost = await postermodel.find({ topnews: true }).sort({ createdAt: -1 })
            console.log(posts, "postssss")
            if (posts) return res.status(200).send({ status: true, latest: posts, topnews: toppost })
            console.log(posts, "possyts")
            return res.status(404).send({ status: false, message: "not found" })

        } else if (type == "video") {
            let videos = await videomodel.find().sort({ createdAt: -1 })
            let topvidoes = await videomodel.find({ topnews: true })


            for (let i = 0; i < videos.length; i++) {
                let obj = {
                    id: videos[i]._id.toString(),
                    video: videos[i].video,
                    title: videos[i].title,
                    description: videos[i].description,
                    shortdescription: striptags(videos[i].description),
                    bookmark: videos[i].bookmark,
                    premium: videos[i].isPremium ?  videos[i].isPremium : false,
                    createdAt: formatDateTime(videos[i].createdAt)

                }
                latestarray.push(obj)

            }

            for (let i = 0; i < topvidoes.length; i++) {
                let obj = {
                    id: topvidoes[i]._id.toString(),
                    video: topvidoes[i].video,
                    title: topvidoes[i].title,
                    description: topvidoes[i].description,
                    shortdescription: striptags(topvidoes[i].description),
                    bookmark: topvidoes[i].bookmark,
                    time: topvidoes[i].timetoread,
                    premium: topvidoes[i].isPremium ?  videos[i].isPremium : false,
                    createdAt: formatDateTime(topvidoes[i].createdAt)

                }
                topnews.push(obj)

            }
            return res.status(200).send({ status: true, latestnews: latestarray, topnews: topnews })
        }

    } catch (err) {
        console.log(err, "error catch")
        return res.status(404).send({ status: false, message: err.message })
    }
}



const getunread = async function (req, res) {
 ///   try {
        const userId = req.decoded.id;
        const excludeFields = {
            stateId: 0,
            stateName: 0,
            stateObj: 0,
            districtId: 0,
            districtObj: 0,
            districtName: 0,
            constituencyId: 0,
            constituencyName: 0,
            constituencyObj: 0
        };

        const viewData = await viewmodel.find({ userId: userId });
        const viewedContentIds = new Set(viewData.map(view => view.contentId.toString()));

        const allArticles = await articlemodel.find({}, excludeFields).sort({ createdAt: -1 });
        const allNews = await newsmodel.find({}, excludeFields).sort({ createdAt: -1 });
        
        // Helper function to format date
      //  const formatDateTime = date => new Date(date).toISOString();
      const formatDateTime = date => {
        const dateTime = new Date(date);
        const year = dateTime.getFullYear();
        const month = dateTime.getMonth() + 1; // add 1 because getMonth() returns 0-11
        const day = dateTime.getDate();
        const hour = dateTime.getHours();
        const minute = dateTime.getMinutes();
      
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      };

        // Filter unread content and add type and specific fields
        var unreadArticles = allArticles
            .filter(article => !viewedContentIds.has(article._id.toString()))
            .map(article => ({
                id: article._id.toString(),
                Image: article.image[0],
                title: article.title,
                description: article.allcontent,
                shortdescription: striptags(article.allcontent),
                bookmark: article.bookmark,
                time: article.timetoread,
                premium:( article.isPremium ) ? article.isPremium : false,
                createdAt: formatDateTime(article.createdAt),
                type: 'article'
            }));

            unreadArticles=(unreadArticles.length>0)?unreadArticles:[];

 console.log(unreadArticles,"unreadArticles");

 console.log(allNews,"allNews");     

        var unreadNews = allNews
            .filter(news => !viewedContentIds.has(news._id.toString()))
            .map(news => ({
                id: news._id.toString(),
                Image: news.image[0],
                title: news.title,
                description: news.allcontent,
                shortdescription: striptags(news.allcontent),
                bookmark: news.bookmark,
                time: news.timetoread,
                premium: (news.isPremium) ? news.isPremium : false,
                createdAt: formatDateTime(news.createdAt),
                type: 'news'
            } ));

        

            console.log(unreadNews,"unreadNews");     

        

        
        // Combine all unread content into a single array
        const unreadContent = [
            ...unreadArticles,
            ...unreadNews
        ];

        console.log(unreadContent,"unreadContent");

        // Respond with unread content
        res.json({ status: true, data: unreadContent, message: "All unread content fetched successfully" });
    // } catch (err) {
    //     return res.json({ status: false, message: err.message });
    // }
};





module.exports.getallposters = getallposters
module.exports.getalldata = getalldata
module.exports.getById = getById
module.exports.getlatest=getlatest
module.exports.getdataforadmin=getdataforadmin
module.exports.getunread=getunread