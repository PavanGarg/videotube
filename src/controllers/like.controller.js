import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import {ApiError} from "../utilis/ApiError.js"
import {ApiResponse} from "../utilis/ApiResponse.js"
import {asyncHandler} from "../utilis/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"not a valid id")
    }
    const video = await Video.findById(videoId)
    const like = await Like.create(
        {
            video : video._id,
            owner : req.user._id
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"liked on video succesFully")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"not a valid id")
    }
    const comment = await Video.findById(commentId)
    const like = await Like.create(
        {
            comment : comment._id,
            owner : req.user._id
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"liked on comment succesFully")
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"not a valid id")
    }
    const Tweet = await Video.findById(tweetId)
    const like = await Like.create(
        {
            tweet : Tweet._id,
            owner : req.user._id
        }
    )
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"liked on Tweet succesFully")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const user = req.user

    const LikedVideos = await Like.aggregate([
        {
            $match:{
                "owner" : user._id,
            }
        },
        {
            $lookup:{
                from : "vidoes",
                localField : "video",
                foreignField : "_id",
                as : "LikedVideo",
                pipeline : [
                    {
                        $project :{
                            videoFIle : 1,
                            thumbnail : 1,
                            title :1,
                            views :1,
                        }
                    }
                ]
            }
        },{
            $addFields:{
                LikedVideo : "$LikedVideo"
            }
        },
        {
            $project :{
                LikedVideo : 1
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(200,LikedVideos,"videoes fatched succesFully")
    )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}