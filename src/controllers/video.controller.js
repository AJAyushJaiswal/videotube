import {asyncHandler} from '../utils/asyncHandler.js';
import mongoose, { isValidObjectId } from 'mongoose';
import {ApiError} from '../utils/ApiError.js';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import {Video} from '../models/video.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';



// tested using postman -- fixed errors - working properly
const getVideoById = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id!");
    }
    
    const video = await Video.findById(videoId).select('-updatedAt -__v').lean();
    
    if(!video){
        throw new ApiError(404, "Video not found!");
    }
    
    return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully!"));
});



// tested using postman -- fixed bugs -- working properly
const publishVideo = asyncHandler(async (req, res) => {
    const {title, description} = req.body;
    
    if(!title?.trim()){
        throw new ApiError(400, "Title is required!");
    }
    
    if(!description?.trim()){
        throw new ApiError(400, "Description is required!");
    }
    
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path; 
    const videoLocalPath = req.files?.video?.[0]?.path; 
    
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail is required!");
    }
    
    if(!videoLocalPath){
        throw new ApiError(400, "Video is required!");
    }

    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
    const videoUpload = await uploadOnCloudinary(videoLocalPath);

    if(!thumbnailUpload){
        throw new ApiError(500, "Error uploading the thumbail!");
    }

    if(!videoUpload){
        throw new ApiError(500, "Error uploading the video!");
    }

    const video = await Video.create({
        title, 
        description, 
        videoFile: videoUpload.url, 
        thumbnail: thumbnailUpload.url, 
        duration: videoUpload.duration, 
        owner: req.user._id
    }).select('-updatedAt -__v');
    
    if(!video){
        throw new ApiError(500, "Error publishing the video!");
    }

    return res.status(200).json(new ApiResponse(200, {video}, "Video published successfully!"));
});


// tested using postman -- fixed bugs -- working fine
const updateVideoDetails = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {title, description} = req.body;
   
    if(!title?.trim()){
        throw new ApiError(400, "Title is required!");
    }
    
    if(!description?.trim()){
        throw new ApiError(400, "Description is required!");
    }
    
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id!");
    }
    
    const video = await Video.findById(videoId).select('owner -_id').lean();
    console.log(video);
    
    if(!video){
        throw new ApiError(404, "Video not found!");
    }
    
    if(!video.owner.equals(req.user._id)){
        throw new ApiError(401, "Unauthorised request!");
    }
    
    const updatedVideo = await Video.findByIdAndUpdate(videoId, {$set: {title, description}}, {new: true}).select('-updatedAt -__v').lean();

    if(!updatedVideo){
        throw new ApiError(500, "Error updating video details!");
    }
    
    res.status(200).json(new ApiResponse(200, {video: updatedVideo}, "Video details updated successfully!"));
});


// tested using postman -- fixed bugs -- working fine
const updateVideoThumbnail = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id!");
    }
    
    const video = await Video.findById(videoId).select('owner thumbnail -_id').lean();

    if(!video){
        throw new ApiError(404, "Video not found!");
    }
    
    if(!video.owner.equals(req.user._id)){
        throw new ApiError(401, "Unauthorised request!");
    } 
    
    const thumbnailLocalPath = req.file?.path;

    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail is required!");
    }
    
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!thumbnail){
        throw new ApiError(500, "Error uploading the new thumbnail!");
    }
    
    const updatedVideo = await Video.findByIdAndUpdate(videoId, {$set: {thumbnail: thumbnail.url}}).select('-updatedAt -__v').lean();

    if(!updatedVideo){
        throw new ApiError(500, "Error updating the thumbnail!");
    }

    const deleteThumbnail = await deleteFromCloudinary(video.thumbnail);

    if(!deleteThumbnail){
        throw new ApiError(500, "Error deleting the old thumbnail!");
    }
    
    return res.status(200).json(new ApiResponse(200, {video: updatedVideo}, "Thumbnail updated successfully!"));
});



// tested using postman -- fixed errors -- working fine
const deleteVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id!");
    }
    
    const video = await Video.findById(videoId).lean();

    if(!video){
        throw new ApiError(404, "Video not found!");
    }
    
    if(!video.owner.equals(req.user._id)){
        throw new ApiError(401, "Unauthorised request!");
    }
    
    const deleteThumbnailFromCloudinary = await deleteFromCloudinary(video.thumbnail);
    const deleteVideoFromCloudinary = await deleteFromCloudinary(video.videoFile, 'video');
    
    if(!deleteThumbnailFromCloudinary){
        throw new ApiError(500, "Error removing the thumbnail!");
    }

    if(!deleteVideoFromCloudinary){
        throw new ApiError(500, "Error removing the video!");
    }

    const deleteVideo = await Video.deleteOne({_id: videoId});       

    if(deleteVideo.deletedCount === 0){
        throw new ApiError(500, "Error deleting the video!");
    }

    return res.status(200).json(new ApiResponse(200, null, "Video deleted successfully!"));
});



// tested using postman -- fixed bugs -- working fine
const togglePublishStatus = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    
    if(!videoId || isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id!");
    }

    // const result = await Video.updateOne({_id: videoId}, {$bit: {isPublished: {xor: 1}}}); // can't use it as xor only works with 0/1 but isPublished is boolean                
    const result = await Video.updateOne({_id: videoId}, [{$set: {isPublished: {$not: "$isPublished"}}}]);

    if(result.matchedCount === 0){
        throw new ApiError(404, "Video not found!");        
    }
    
    if(result.modifiedCount === 0){
        throw new ApiError(400, "Error changing publish status of the video!");
    }
    
    return res.status(200).json(new ApiResponse(200, null, "Video publish status changed successfully!"));
});



const getAllVideos = asyncHandler(async (req, res) => {

});



export {
    getVideoById,
    publishVideo,
    updateVideoDetails,
    updateVideoThumbnail,
    deleteVideo,
    togglePublishStatus,
    getAllVideos
}