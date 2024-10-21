import mongoose, {isValidObjectId} from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utilis/ApiError.js"
import {ApiResponse} from "../utilis/ApiResponse.js"
import {asyncHandler} from "../utilis/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"not a valid id")
    }

    const subscribe = await Subscription.create(
        {
            subscriber : req.user._id,
            channel : new mongoose.Types.ObjectId(channelId)
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,subscribe,"subscribed successFully")
    )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"not a valid id")
    }

    const subscriberList = await Subscription.aggregate([
        {
            $match :{
                "channel" : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from : "users",
                localField : "subscriber",
                foreignField : "_id",
                as : "subscribers",
                pipeline : [
                    {
                        $project :{
                            fullName : 1,
                            username : 1,
                            avatar:1
                        }
                    },
                    {
                        $addFields :{
                            $subscriber : "$subscribers"
                        }
                    }
                ]
            }
        },
        {
            $project:{
                subscriber :1
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,subscriberList,"subscriber list of channel")
    )

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"not a valid id")
    }

    const ChannelList = await Subscription.aggregate([
        {
            $match :{
                "subscriber" : new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from : "users",
                localField : "channel",
                foreignField : "_id",
                as : "channels",
                pipeline : [
                    {
                        $project :{
                            fullName : 1,
                            username : 1,
                            avatar:1
                        }
                    },
                    {
                        $addFields :{
                            $channel : "$channels"
                        }
                    }
                ]
            }
        },
        {
            $project:{
                channel :1
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,ChannelList,"channels which are subscribed by the user")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}