import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {Video} from '../models/video.model.js';
import {Like} from '../models/like.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    if(!videoId){
        throw new ApiError(404, "Video to like not found!");
    }

    const video = await Video.exists({_id: videoId});
    if(!video){
        throw new ApiError(404, "Video to like not found!");
    }

    const videoLiked = await Like.exists({video: videoId, likedBy: req.user._id}); 

    if(videoLiked){
        const removeLike = await Like.findByIdAndDelete(videoLiked._id);
        if(!removeLike){
            throw new ApiError(400, "Failed to like the video!");
        }
        
        return res.status(200).json(new ApiResponse(200, null, "Liked removed successfully!"));
    }

    const addLike = await Like.create({video: videoId, likedBy: req.user._id});
    if(!addLike){
        throw new ApiError(400, "Failed to like the video!");
    }
    
    return res.status(200).json(new ApiResponse(200, null, "Video liked successfully!"));
});



const toggleCommentLike = asyncHandler(async (req, res) => {

});



const togglePostLike = asyncHandler(async (req, res) => {

});



const getLikedVideos = asyncHandler(async (req, res) => {

});



export {
    toggleVideoLike,
    toggleCommentLike,
    togglePostLike,
    getLikedVideos
}