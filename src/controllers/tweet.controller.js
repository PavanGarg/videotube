import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utilis/ApiError.js"
import {ApiResponse} from "../utilis/ApiResponse.js"
import {asyncHandler} from "../utilis/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if(!content){
        throw new ApiError(400,"content is empty")
    }

    const tweet = await Tweet.create(
        {
            content,
            owner : req.user._id
        }
    )
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"done sucessfully")
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(200,"enter valid userid")
    }
    const user = User.findById(userId)
    if(!user){
        throw new ApiError(400,"user not exist")
    }

    const tweets = await Tweet.aggregate([
        {
            $match :{
                "owner" : user._id
            }
        },
        {
            $project :{
                content : 1
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweets,"all tweets of user")
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {newcontent} = req.body
    if(!isValidObjectId(tweetId)){
        throw new ApiError(200,"enter valid tweetid")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set :{
                content : newcontent
            }
        },
        {new: true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"tweet updated sucess")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(200,"enter valid tweetid")
    }

    const tweet = Tweet.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(tweetId),
                "owner" : req.user._id
            }
        },
    ])

    if(!tweet){
        throw new ApiError(400,"you can't delete others comment")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"tweet delete sucessfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}