import { asyncHandler } from "../utilis/asyncHandler.js";
import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utilis/ApiError.js"
import {ApiResponse} from "../utilis/ApiResponse.js"
import {uploadOnCloudinary} from "../utilis/cloudinary.js"
import { User } from "../models/user.model.js";
import { deleteOnCloudinary } from "../utilis/cloudinary.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    if(!userId){
        throw new ApiError(200,"userId field is required")
    }
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(200,"not a valid user id")
    }
    const videoes = await Video.aggregate([
            {
              $match: {
                  "owner" : user._id
              }
            },
            {
                $lookup :{
                    from : "users",
                    localField : "owner",
                    foreignField : "_id",
                    as : "createdBy",
                    pipeline : [
                        {
                            $project:{
                                fullName : 1,
                                username : 1,
                                avatar : 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields :{
                    createdBy : "$createdBy"
                }
            },
            {
                $project :{
                    videoFile : 1,
                    thumbnail :1,
                    title :1,
                    description :1,
                    createdBy : 1

                }
            },
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,videoes,"all videoes fatched succesfully")
    )

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title && !description){
        throw new ApiError(400, "title and description both are required field")
    }

    const user = req.user;

    if(!user){
        throw new ApiError(400,"you are not logged in")
    }

    const videopath =  await req.files?.videoFile[0].path;
    const thumbnailpath =  await req.files?.thumbnail[0].path;

    if(!videopath){
        throw new ApiError(400,"video is not available");
    }

    if(!thumbnailpath){
        throw new ApiError(400,"thumbnail is not provided");
    }
    const videocloudinarypath = await uploadOnCloudinary(videopath);
    const thumbnailcloudinarypath = await uploadOnCloudinary(thumbnailpath);

    const video = await Video.create(
        {
            videoFile : videocloudinarypath.url,
            title : title,
            description : description,
            owner : user._id,
            duration : videocloudinarypath.duration,
            thumbnail : thumbnailcloudinarypath.url,
            isPublished : true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"video published succesfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    const videoid = isValidObjectId(videoId);
    if(!videoid){
        throw new ApiError(400,"not a valid id")
    }

    const user = req.user;
    if(!user){
        throw new ApiError(400,"user does not exist");
    }

    const video = await Video.findById(videoId).select("-owner ");
    if(!video)
        throw new ApiError(400,"video does not exist");
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"video find succesfully")
    )


})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const thumbnailpath =  await req.file?.path;
    if(!thumbnailpath){
        throw new ApiError(400,"thumbnail is not provided");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(200,"not a valid id")
    }
    const thumbnailcloudinarypath = await uploadOnCloudinary(thumbnailpath)
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set :{
                thumbnail : thumbnailcloudinarypath.url,
            }
        },
        {
            new : true
        }
    )

    if(!video){
        throw new ApiError(400,"video not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,video, "Thumbnail changed successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"not a valid videoId")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"video not exist")
    }
    await deleteOnCloudinary(video.videoFile.url)
    await deleteOnCloudinary(video.thumbnail.url)
    
    await Video.findOneAndDelete(videoId)
    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"video  deleted succesfully")
    )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}