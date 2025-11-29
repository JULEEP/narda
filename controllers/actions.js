const likemodel = require("../models/likemodel")
const commentmodel = require("../models/commentmodel")
const postermodel = require('../models/postermodel')
const articlemodel = require("../models/articlemodel")
const usermodel = require("../models/usermodel")
const newsmodel = require("../models/newsmodel")
const videosmodel = require("../models/videosmodel")
const slidermodel = require("../models/slidermodel");
const mongoose = require("mongoose");
const striptags = require('striptags');

function formatDateTime(dateStr) {
    try {
        const date = new Date(dateStr);
        const convertedDate = new Date(date.toLocaleString('en-US', { timeZone: "Asia/Kolkata" }));
        const formattedDate = convertedDate.toLocaleString('en-US', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        return formattedDate;
    } catch (error) {
        console.error('Error in formatDateTime:', error.message);
        return dateStr; // Return the original date string in case of error
    }
}



const likePoster = async function (req, res) {
  try {
    const contentId = req.body.contentId;
    req.body.name = req.decoded.email;
    req.body.userId = req.decoded.id;
    const type = req.body.type;

    let model;
    if (type === "poster") {
      model = postermodel;
    } else if (type === "article") {
      model = articlemodel;
    } else if (type === "video") {
      model = videosmodel;
    } else if (type === "slider") {
      model = slidermodel; // ✅ New type added here
    } else {
      return res.status(400).json({ status: false, message: "Invalid content type" });
    }

    const isliked = await likemodel.findOne({ contentId: contentId, userId: req.decoded.id });

    if (isliked) {
      // 🧊 If already liked → remove like
      await model.findByIdAndUpdate({ _id: contentId }, { $inc: { likes: -1 } }, { new: true });
      await likemodel.findByIdAndDelete({ _id: isliked._id });
      return res.status(200).json({ status: true, message: "Removed like successfully" });
    } else {
      // ❤️ Add like
      const addlike = await model.findByIdAndUpdate({ _id: contentId }, { $inc: { likes: 1 } }, { new: true });
      if (addlike) {
        const likedata = await likemodel.create(req.body);
        if (likedata) {
          return res.status(200).json({ status: true, message: "Added like successfully" });
        } else {
          return res.status(404).json({ status: false, message: "Unable to like this content" });
        }
      } else {
        return res.status(404).json({ status: false, message: "Content not found" });
      }
    }

  } catch (err) {
    console.error("Like Error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};



const getlikes = async function (req, res) {
    try {
        let contentId = req.body.contentId
        const content = await likemodel.find({ contentId: contentId })
        if (content) return res.status(200).json({ data: content })

    } catch (err) {
        return res.status(404).json({ message: "unable to a like" })
    }

}

const getcomments = async function (req, res) {
    try {
        let contentId = req.body.contentId
        const content = await commentmodel.find({ contentId: contentId })
       
        const defaultimage = "uploads\\profile.png"

        let dataaray = []
        for (let i = 0; i < content.length; i++) {
            let  userdata= await usermodel.findById({_id: content[i].user})
            console.log(content[i].createdAt)
            let time=formatDateTime(content[i].createdAt)
            let obj = {
                name: content[i].name,
                comment: content[i].comment,
                image: (userdata.profilepic) ? userdata.profilepic : defaultimage,
                commentedAt: time
            }
            console.log( content[i].createdAt, "commnetdatre")
            dataaray.push(obj)
        }
        if (content) return res.status(200).json({ status: true, data: dataaray })

    } catch (err) {
        console.log(err, "error")
        return res.status(404).json({ status: false, message: "Unable to get commnents" })
    }

}


const commentPoster = async function (req, res) {
    try {
        const userdetails = await usermodel.findById({ _id: req.decoded.id })
        if (!userdetails) return res.status(400).send({ sttaus: false, message: "please login" })
        let obj = {
            name: userdetails.name,
            userId: userdetails._id.toString(),
            contentId: req.body.contentId,
            comment: req.body.comment,
            type:req.body.type,
            user: req.decoded.id

        }

        console.log(obj, "object dataa")

        // let contentId = req.body.contentId
        // req.body.name = userdetails.name
        // req.body.userId = userdetails._id.toString()
        // console.log(req.body,"comment body")
        let type = req.body.type
        let model
        if (type === "poster") {
            model = postermodel
        } else if (type == "article") {
            model = articlemodel
        } else if (type == "video") {
            model = videosmodel
        }

        const addcomment = await model.findByIdAndUpdate({ _id: req.body.contentId }, { $inc: { comments: 1 } }, { new: true })
        if (addcomment) {
            let commentdata = await commentmodel.create(obj)
            if (commentdata) {
                return res.status(200).json(commentdata)

            } else {
                return res.status(404).json({ message: "unable to comment" })
            }
        } else {
            return res.status(404).json({ message: "unable to comment" })
        }

    } catch (err) {
        console.log(err, "catch err")
        return res.status(500).json({ message: "unable to comment" })
    }
}


const bookmark = async function (req, res) {
    try {
        console.log(req.decoded);
        const id = req.body.dataId;
        const type = req.body.type;
        let userid = req.decoded.id;
        let obj = {
            id: id,
            type: type
        };

        const userdata = await usermodel.findById({ _id: userid });
        if (!userdata) {
            return res.status(404).send({ error: "User not found" });
        }
        const bookmarkIndex = userdata.bookmarks.findIndex(bookmark => bookmark.id === id && bookmark.type === type);

        if (bookmarkIndex > -1) {
            userdata.bookmarks.splice(bookmarkIndex, 1);
        } else {
            userdata.bookmarks.push(obj);
        }

        // Save the updated user data
        const updateuser = await userdata.save();
        console.log(updateuser);

        // Respond with the updated user data
        if (updateuser) {
            return res.status(200).send(updateuser);
        }
    } catch (err) {
        return res.status(400).send({ err: err.message });
    }
};

const viewbookmark = async function (req, res) {
    try {
        let type = req.body.type
        let id = req.body.id
        let data
        if (type === "article") {
            data = await articlemodel.findById({ _id: id })
        } else if (type == "news") {
            data = await newsmodel.findById({ _id: id })
        } else if (type == "video") {
            data = await videosmodel.findById({ _id: id })
        } else if (type == "poster") {
            data = await postermodel.findById({ _id: id })
        }
        if (data) return res.status(200).send({ status: true, message: "fetched data", data: data })

        return res.status(200).send({ status: false, message: "Not found" })

    } catch (err) {
        return res.status(400).send({ status: false, message: err.message })
    }

}



const viewallbookmarks = async function (req, res) {
    try {

        const userdata = await usermodel.findById({ _id: req.decoded.id })
        let dataarray = []
        for (let i = 0; i < userdata.bookmarks.length; i++) {
            if (userdata.bookmarks[i] && userdata.bookmarks[i].type == "article") {
                const idd = userdata.bookmarks[i].id.toString()
                let data = await articlemodel.findOne({ _id: new mongoose.Types.ObjectId(idd) })
                if (data) { 
                  const idc = data._id
                  let obj = {
                    id: idc,
                    Image: data.image[0],
                    title: data.title,
                    description: data.allcontent,
                    shortdescription: striptags(data.allcontent),
                    time: data.timetoread,
                    premium: data.isPremium,
                    type: "article",
                    createdAt: formatDateTime(data.createdAt)
                  }
                  console.log(obj, "objectttt")
                  dataarray.push(obj)
                }
              
            } else if (userdata.bookmarks[i].type == "news") {
                const idd = userdata.bookmarks[i].id.toString()
                let data = await newsmodel.findOne({ _id: new mongoose.Types.ObjectId(idd) })
                if(data)
                { const idc = data._id
                    let obj = {
                        id: idc,
                        Image: data.image[0],
                        title: data.title,
                        description: data.allcontent,
                        shortdescription: striptags(data.allcontent),
                        time: data.timetoread,
                        premium: data.isPremium,
                        type: "news",
                        createdAt: formatDateTime(data.createdAt)
                    }
                    dataarray.push(obj)
                }
               
            }
        }
        return res.status(200).json({ status: "success", data: dataarray, message: "all bookmarks fetched successfully" })

    } catch (err) {
        console.log(err, "erruuf")
        return res.status(400).send({ status: false, message: err.message })
    }

}


const moment = require('moment');

// const searchdata = async function (req, res) {
//     try {
//         const searchKey = req.body.key;
//         const regex = new RegExp(searchKey, 'i'); // 'i' for case-insensitive search

//         // Perform the search across all collections
//         const articles = await articlemodel.find({ title: regex });
//         const videos = await videosmodel.find({ title: regex });
//         const news = await newsmodel.find({ title: regex });

//         // Helper function to format date
//         const formatDateTime = (date) => moment(date).format('DD MMM YYYY, h:mm a');

//         // Format the results for articles
//         const formattedArticles = articles.map(article => ({
//             id: article._id.toString(),
//             type: "article",
//             Image: article.data[0].image,
//             title: article.title,
//             description: article.data[0].content,
//             bookmark: article.bookmark,
//             time: article.timetoread,
//             premium: article.isPremium,
//             createdAt: formatDateTime(article.createdAt)
//         }));

//         // Format the results for videos
//         const formattedVideos = videos.map(video => ({
//             id: video._id.toString(),
//             type: 'video',
//             video: video.video,
//             title: video.title,
//             description: video.description,
//             bookmark: video.bookmark,
//             time: video.timetoread,
//             youtube: video.video.includes('youtube.com'),
//             thumbnail: video.thumbnail || "uploads/thumbnail.jpg",
//             createdAt: formatDateTime(video.createdAt)
//         }));

//         // Format the results for news
//         const formattedNews = news.map(newsItem => ({
//             id: newsItem._id.toString(),
//             type: "news",
//             Image: newsItem.data[0].image,
//             title: newsItem.title,
//             description: newsItem.data[0].content,
//             bookmark: newsItem.bookmark,
//             time: newsItem.timetoread,
//             premium: newsItem.isPremium,
//             createdAt: formatDateTime(newsItem.createdAt)
//         }));

//         // Helper function to group data by date difference
//         const groupByDate = (items) => {
//             const groupedData = {
//                 "1 day ago": [],
//                 "3 days ago": [],
//                 "7 days ago": []
//             };

//             const now = moment();

//             items.forEach(item => {
//                 const createdAt = moment(item.createdAt, 'DD MMM YYYY, h:mm a');
//                 const daysDiff = now.diff(createdAt, 'days');

//                 if (daysDiff <= 1) {
//                     groupedData["1 day ago"].push(item);
//                 } else if (daysDiff <= 3) {
//                     groupedData["3 days ago"].push(item);
//                 } else if (daysDiff <= 7) {
//                     groupedData["7 days ago"].push(item);
//                 }
//             });

//             return groupedData;
//         };

//         const groupedArticles = groupByDate(formattedArticles);
//         const groupedVideos = groupByDate(formattedVideos);
//         const groupedNews = groupByDate(formattedNews);

//         res.status(200).send({
//             status: true,
//             data: {
//                 articles: groupedArticles,
//                 videos: groupedVideos,
//                 news: groupedNews
//             },
//             message: "Data found according to your search"
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ status: false, message: 'An error occurred while searching' });
//     }
// };


const searchdata = async function (req, res) {
    try {
        const { key: searchKey, type, time } = req.body;
        const regex = new RegExp(searchKey, 'i'); // 'i' for case-insensitive search

        // Helper function to format date
        const formatDateTime = (date) => moment(date).format('DD MMM YYYY, h:mm a');

        let formattedData = [];

        // Perform the search and format the results based on the type
        if (type === 'article') {
            const articles = await articlemodel.find({ title: regex }).sort({ createdAt: -1 });
            formattedData = articles.map(article => ({
                id: article._id.toString(),
                type: "article",
                Image: article.image[0],
                title: article.title,
                description: article.allcontent,
                shortdescription: striptags(article.allcontent),
                bookmark: article.bookmark,
                time: article.timetoread,
                premium: article.isPremium,
                createdAt: formatDateTime(article.createdAt)
            }));
        } else if (type === 'video') {
            const videos = await videosmodel.find({ title: regex });
            formattedData = videos.map(video => ({
                id: video._id.toString(),
                type: 'video',
                video: video.video,
                title: video.title,
                description: video.description,
                shortdescription: striptags(video.allcontent),
                bookmark: video.bookmark,
                time: video.timetoread,
                youtube: video.video.includes('youtube.com') || video.video.includes('youtu.be'),
                thumbnail: video.thumbnail || "uploads/thumbnail.jpg",
                createdAt: formatDateTime(video.createdAt)
            }));
        } else if (type === 'news') {
            const news = await newsmodel.find({ title: regex }).sort({ createdAt: -1 });
            formattedData = news.map(newsItem => ({
                id: newsItem._id.toString(),
                type: "news",
                Image: newsItem.image[0],
                title: newsItem.title,
                description: newsItem.allcontent,
                shortdescription: striptags(newsItem.allcontent),
                bookmark: newsItem.bookmark,
                time: newsItem.timetoread,
                premium: newsItem.isPremium,
                createdAt: formatDateTime(newsItem.createdAt)
            }));
        } else {
            res.status(400).json({ status: false, message: 'Invalid type specified' });
            return;
        }

        // Helper function to group data by date difference
        const groupByDate = (items) => {
            const groupedData = {
                "1 day ago": [],
                "3 days ago": [],
                "7 days ago": [],
                "1 month ago": [],
                "All": items
            };

            const now = moment();

            items.forEach(item => {
                const createdAt = moment(item.createdAt, 'DD MMM YYYY, h:mm a');
                const daysDiff = now.diff(createdAt, 'days');
                console.log(daysDiff, "days ago")
                if (daysDiff <= 1) {
                    groupedData["1 day ago"].push(item);
                } else if (daysDiff <= 3) {
                    groupedData["3 days ago"].push(item);
                } else if (daysDiff <= 7) {
                    groupedData["7 days ago"].push(item);
                } else if (daysDiff <= 30) {
                    
                    groupedData["1 month ago"].push(item);
                }
            });

            return groupedData;
        };
     

        // Group the data by date
        const groupedData = groupByDate(formattedData);
       

        // Filter by the selected time slot
        const filterByTime = (data, timeSlot) => {
            if (timeSlot === 'All' || !timeSlot) {
                return data.All;
            }
            return data[timeSlot] || [];
        };

        const filteredData = filterByTime(groupedData, time);

        res.status(200).send({
            status: true,
            data: filteredData,
            message: "Data found according to your search"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'An error occurred while searching' });
    }
};









// const share= async function(req,res){
//     try{
//         let contentId= req.body.contentId
//         req.body.name= req.decoded.email
//         req.body.userId= req.decoded.id

//         const addcomment= await postermodel.findByIdAndUpdate({_id:contentId}, {  $inc: { comments: 1 }} , {new:true} )
//         if(addcomment) {
//             let commentdata= await commentmodel.create(req.body)
//             if(commentdata) {
//               return res.status(200).json(commentdata)

//         }else{
//             return res.status(404).json({message:"unable to comment"})
//         }
//     }else{
//         return res.status(404).json({message:"unable to comment"})
//     }

//     }catch(err){
//         return res.status(500).json({message:"unable to comment"})
//     }

// }



module.exports.likePoster = likePoster
module.exports.commentPoster = commentPoster
module.exports.bookmark = bookmark
module.exports.getlikes = getlikes
module.exports.getcomments = getcomments
module.exports.viewbookmark = viewbookmark
module.exports.viewallbookmarks = viewallbookmarks
module.exports.searchdata = searchdata