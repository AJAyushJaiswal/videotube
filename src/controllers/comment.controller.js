import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {Video} from '../models/video.model.js';
import {Comment} from '../models/comment.model.js';
import { ApiResponse } from '../utils/ApiResponse';



const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
});



const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {content} = req.body;

    if(!content?.trim()){
        throw new ApiError(400, "Comment cannot be empty!");        
    }
    
    const videoExists = await Video.exists({_id: videoId});
    if(!videoExists){
        throw new ApiError(400, "Video to add comment not found!");
    }
    
    const comment = await Comment.create({content, video: videoId, owner: req.user._id}).lean();
    if(!comment){
        throw new ApiError(400, "Failed to add comment!");
    }
    
    return res.status(200).json(new ApiResponse(200, comment, "Comment added successfully!"));
});



const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const {content} = req.body;

    if(!content?.trim()){
        throw new ApiError(400, "Comment cannot be empty!");
    }
    
    const comment = await Comment.findById(commentId).lean();

    if(!comment){
        throw new ApiError(404, "Comment to update not found!");
    }
    
    if(comment.owner !== req.user._id){
        throw new ApiError(401, "Unauthorised request!");
    }
    
    comment.content = content;
    const updatedComment = await comment.save();
    
    if(!updatedComment){
        throw new ApiError(400, "Failed to update comment!");
    }
    
    return res.status(200).json(new ApiResponse(200, {comment: updatedComment}, "Comment updated successfully!"));
});


const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    
    const comment = await Comment.findById(commentId).lean();
    
    if(!comment){
        throw new ApiError(400, "Comment to delete not found!");
    }
    
    if(req.user._id !== comment.owner){
        throw new ApiError("Unauthorised request!");
    }
    
    const deleteComment = await Comment.findOneAndDelete({_id: commentId});
    if(!deleteComment){
       throw new ApiError(400, "Failed to delete comment!"); 
    }
    
    return res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully!"));
});


export {
    getVideoComments,
    createComment,
    updateComment,
    deleteComment
}