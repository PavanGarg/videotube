import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utilis/ApiError.js"
import {ApiResponse} from "../utilis/ApiResponse.js"
import {asyncHandler} from "../utilis/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
     //TODO: create playlist
    const {name, description} = req.body
    if(!name && !description){
        throw new ApiError(400,"name and description both are required field")
    }

    const user =  req.user
    const playlist = await Playlist.create(
        {
            name:name,
            description : description,
            owner : user._id
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"playlist created succesfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"not a valid id")
    }
    
    const playlists = await Playlist.aggregate([
        {
            $match :{
                "owner" : new mongoose.Types.ObjectId(userId)
            }
        }
    ])
    // console.log(playlists);
    // console.log(userId);
    // console.log(new mongoose.Types.ObjectId(userId));
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlists,"all playlists of user fatched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"not a valid id")
    }
    
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"playlistId NOT FOUND")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"playlist found sucess")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) && !isValidObjectId(videoId)){
        throw new ApiError(400,"not a valid id")
    }

    const video1 = await Playlist.aggregate([
        {
            $match:{
                _id : new mongoose.Types.ObjectId(playlistId), 
                "videos" : new mongoose.Types.ObjectId(videoId)
            }
        }
    ])
    if(video1.length){
        throw new ApiError(400,"video already exist in playlist")
    }
    
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push :{
                videos : videoId
            }
        },
        {new : true}
    )
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"video added succesfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!isValidObjectId(playlistId) && !isValidObjectId(videoId)){
        throw new ApiError(400,"not a valid id")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull :{
                videos : videoId
            }
        },
        {new : true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"video removed succesfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"not a valid id")
    }

    const playlist = await Playlist.aggregate([
        {
            $match:{
                _id : new mongoose.Types.ObjectId(playlistId),
                "owner" : req.user._id
            }
        }
    ])
    if(!playlist.length){
        throw new ApiError(400,"user with playlist not exist")
    }
    await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"not a valid id")
    }

    if(!name && !description){
        throw new ApiError(400,"enter all values")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set :{
                name,
                description
            }
        },
        {new : true}
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"playlist updated sucessFUlly")
    )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}