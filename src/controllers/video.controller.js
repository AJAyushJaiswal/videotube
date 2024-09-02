import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import {Video} from '../models/video.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';



const publishVideo = asyncHandler(async (req, res) => {
    const {title, description} = req.body;
    
    if(!title?.trim()){
        throw new ApiError(400, "Title is required!");
    }
    
    if(!description.trim()){
        throw new ApiError(400, "Description is required!");
    }
    
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path; 
    const videoLocalPath = req.files?.video[0]?.path; 
    
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail is required!");
    }
    
    if(!videoLocalPath){
        throw new ApiError(400, "Video is required!");
    }
    
    const thumbnailUpload = uploadOnCloudinary(thumbnailLocalPath);
    const videoUpload = uploadOnCloudinary(videoLocalPath);

    if(!thumbnailUpload){
        throw new ApiError(500, "Error uploading thumbail to cloudinary!");
    }

    if(!videoUpload){
        throw new ApiError(500, "Error uploading video to cloudinary!");
    }
    
    const video = await Video.create({title, description, videoFile: videoUpload.url, thumbnail: thumbnailUpload.url, duration: videoUpload.duration, owner: req.user._id}).lean();
    
    if(!video){
        throw new ApiError(500, "Error creating video record in database!");
    }
    
    return res.status(200).json(new ApiResponse(200, video, "Video uploaded successfully!"));
});



const updateVideoDetails = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {title, thumbnail} = req.body;
   
    if(!title?.trim() || !thumbnail?.trim()){
        throw new ApiError(400, "Title and description are required!");
    }
    
    const video = await Video.findById(videoId).lean();
    if(!video){
        throw new ApiError(404, "Video not found!");
    }
    
    if(video.owner !== req.user._id){
        throw new ApiError(401, "Unauthorised request!");
    }
    
    const updatedVideo = await Video.findByIdAndUpdate(videoId, {$set: {title, description}}, {new: true}).lean();
    if(!updatedVideo){
        throw new ApiError(500, "Error updating video details!");
    }
    
    res.status(200).json(new ApiResponse(200, updatedVideo, "Video details updated successfully!"));
});


const updateVideoThumbnail = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    
    const video = await Video.findById(videoId).lean();
    if(!video){
        throw new ApiError(404, "Video not found!");
    }
    
    if(video.owner !== req.user._id){
        throw new ApiError(401, "Unauthorised request!");
    } 
    
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail is required!");
    }
    
    const thumbnail = uploadOnCloudinary(thumbnailLocalPath);
    if(!thumbnail){
        throw new ApiError(500, "Error uploading thumbnail to cloudinary!");
    }
    
    const updatedVideo = await Video.findByIdAndUpdate(videoId, {$set: {thumbnail}}).lean();
    if(!updatedVideo){
        throw new ApiError(500, "Error updating thumbnail in database!");
    }

    const deleteThumbnail = deleteFromCloudinary(video.thumbnail);
    if(!deleteThumbnail){
        throw new ApiError(500, "Error deleting thumbnail from cloudinary!");
    }
    
    return res.status(200).json(new ApiResponse(200, {video: updatedVideo}, "Thumbnail updated successfully!"));
});

