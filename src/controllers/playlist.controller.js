import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {Playlist} from '../models/playlist.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {Video} from '../utils/ApiResponse.js';



const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body;
    if(!name?.trim() || !description?.trim()){
        throw new ApiError(400, "Name and description are required!");
    }
    
    const playlist = await Playlist.create({name, description, owner: req.user._id}).lean();
    if(!playlist){
        throw new ApiError(400, "Error creating the playlist!");
    }
    
    return res.status(200).json(200, null, "Playlist created successfully!");
});



const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    
    const playlist = await Playlist.findById(playlistId); 
    if(!playlist){
        throw new ApiError(404, "Playlist not found!");
    }
    
    const videoExists = await Video.exists(videoId);
    if(!videoExists){
        throw new ApiError(404, "Video not found!");
    }
    
    if(playlist.owner !== req.user._id){
        throw new ApiError(401, "Unauthorised request!");
    }
    
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {$push: {vidoes: videoId}}, {new: true}).lean();
    if(!updatedPlaylist){
        throw new ApiError(400, "Error adding video to playlist!");
    }
    
    return res.status(200).json(new ApiResponse(200, {playlist: updatePlaylist}, "Video added to playlist!"));
});



const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;

    const playlist = await Playlist.findById(playlistId).lean();
    if(!playlist){
        throw new ApiError(404, "Playlist not found!");        
    }
    
    const videoExists = await Video.exists({_id: videoId});
    if(!videoExists){
        throw new ApiError(404, "Video not found!");
    }
    
    if(playlist.owner !== req.user._id){
        throw new ApiError(401, "Unauthorised request!");
    }
    
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {$pop: {videos: playlistId}}, {new: true}).lean();
    if(!updatedPlaylist){
        throw new ApiError(400, "Error removing video from playlist!");
    }
    
    res.status(200).json(new ApiResponse(200, null, "Video removed from playlist successfully!"));
});



const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    const {name, description} = req.body;
    
    if(!name?.trim() || !description?.trim()){
        throw new ApiError(400, "Name and  description are required!");
    }
    
    if(playlistId){
       throw new ApiError(400, "Playlist not found!"); 
    }
    
    const playlist = await Playlist.findById(playlistId).lean();

    if(!playlist){
        throw new ApiError(404, "Playlist not found!");
    }
    
    if(playlist.owner !== req.user._id){
        throw new ApiError(401, "unauthorised request!");
    }    
    
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {name, description}, {new: true}).select('-videos -__v _id').lean();
    if(!updatePlaylist){
        throw new ApiError(400, "Error updating the playlist!");
    }
    
    return res.status(200).json(new ApiResponse(200, {playlist: updatedPlaylist}, "Playlist updated successfully!"));
});
