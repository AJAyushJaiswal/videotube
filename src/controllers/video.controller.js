import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
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