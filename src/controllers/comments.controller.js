import mongoose, { isValidObjectId, Mongoose } from "mongoose"
import {Comment} from "../models/comments.model.js"
import {ApiError} from "../utilis/ApiError.js"
import {ApiResponse} from "../utilis/ApiResponse.js"
import {asyncHandler} from "../utilis/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"not a valid id");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"video does not exist")
    }
    const comments = await Comment.aggregate([
        {
            $match : {
                "video" :  video._id
            }
        },
        {
            $lookup :{
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as : "commenteduser",
                pipeline : [
                    {
                        $project :{
                            fullName : 1,
                            username : 1,
                            avatar : 1
                        }
                    },
                    {
                        $addFields :{
                            commenteduser : "$commenteduser"
                        }
                    }
                ]
            }
        },
        {
            $project :{
                content : 1,
                commenteduser :1
            }
        },
        {
            $limit : limit
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,comments,"all comments fetched succesfully")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"not a valid id")
    }
    // console.log(content);
    if(!videoId && !content){
        throw new ApiError(400,"not a videoId or comment")
    }

    const user = req.user;
    const video1 = await Video.findById(videoId);
    console.log(video1._id)
    console.log(user._id)
    if(!video1){
        throw new ApiError(400,"video does not exist")
    }
    const comment = await Comment.create(
        {
            content : content,
            video : video1._id,
            owner : user._id
        }
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"comment done succesfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {newcontent} = req.body
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"not a valid id")
    }
    const user = req.user
    console.log(newcontent)
    const comment = await Comment.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(commentId),
                "owner" : user._id
            }
        }
    ])
    console.log(comment)
    if(!comment.length){
        throw new ApiError(400,"can't update others comment or comment does not exist")
    }

    const updatedcomment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set :{
                content : newcontent
            }
        },
        {
            new : true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedcomment,"comment updated succesfully")
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    if(!isValidObjectId(commentId) ){
        throw new ApiError(400,"not a commentId")
    }

    await Comment.findByIdAndDelete(commentId);
   
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"comment deleted succesfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
