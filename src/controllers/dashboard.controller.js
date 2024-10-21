import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utilis/ApiError.js"
import {ApiResponse} from "../utilis/ApiResponse.js"
import {asyncHandler} from "../utilis/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId} = req.params
    console.log(channelId);
    
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"not a valid id")
    }
    // total subscribers
    const subscribers = await Subscription.aggregate([
        {
            $match :{
                "channel" : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $count : "subscribers"
        }
    ])

    // total Videos
    const videos = await Video.aggregate([
        {
            $match:{
                "owner" : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $count : "total_videos"
        }
    ])

    // total Likes
    const Likes = await Like.aggregate([
        {
            $lookup :{
                from : "videos",
                localField : "video",
                foreignField : "_id",
                as : "allvideos",
                pipeline :[
                    {
                        $match:{
                            "owner" : new mongoose.Types.ObjectId(channelId)
                        }
                    }
                ]
            }
        },
        {
            $count : "total_likes"
        }
    ])

    // total views
    const views = await Video.aggregate([
        {
            $match:{
                "owner" : new mongoose.Types.ObjectId(channelId)
            }
        },{
            $group:{
                _id : null,
                totalViews : {
                    $sum : "$views"
                }
            }
        },
        {
            $project:{
                _id : 0,
                totalViews :1
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,{
            subscribers : subscribers[0],
            videos : videos[0],
            likes : Likes[0],
            views : views[0]
        },"all channel details")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const videos = await Video.aggregate([
        {
            $match:{
                "owner" : req.user._id
            }
        },
        {
            $project:{
                videoFile : 1,
                thumbnail :1,
                title :1,
                views :1,
                duration :1
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"all videos that are uploaded by the channel")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }