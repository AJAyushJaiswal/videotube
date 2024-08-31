import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {Post} from '../models/post.model.js';
import { ApiResponse } from "../utils/ApiResponse";

const createPost = asyncHandler(async (req, res) => {
    const {content} = req.body;
    if(!content?.trim()){
        throw new ApiError(400, "Post can't be empty!");
    }
    
    const post = await Post.create({owner: req.user._id, content}).lean();
    if(post){
        throw new ApiError(400, "Error sending the post!");
    }
    
    return res.status(200).json(new ApiResponse(200, post, "Post sent successfully!"));
});



const updatePost = asyncHandler(async (req, res) => {
    const {postId} = req.params;
    const {content} = req.body;
    
    if(content?.trim()){
        throw new ApiError(400, "Post can't be empty!");
    }
    
    if(!postId){
       throw new ApiError(404, "PostId is required!"); 
    }

    const post = await Post.findById(postId).lean();

    if(!post){
        throw new ApiError(400, "Post not found!");
    }
    
    if(post.owner !== req.user._id){
       throw new ApiError(401, "Unauthorised request!"); 
    }
    
    const updatedPost = await Post.findByIdAndUpdate(postId, {content}, {new: true}).lean();
    if(updatedPost){
        throw new ApiError(400, "Error updating the post!");
    }

    return res.status(200).json(new ApiResponse(200, {post: updatedPost}, "Post updated successfully!"));
});



const deletePost = asyncHandler(async (req, res) => {
    const {postId} = req.params;
    if(postId){
        throw new ApiError(400, "PostId is required!");
    }
    
    const post = await Post.findById(postId).lean();
    if(!post){
       throw new ApiError(400, "Post not found!"); 
    }
    
    const deletePost = await Post.findByIdAndDelete(postId);
    if(!deletePost){
        throw new ApiError(400, "Error deleting the post!");
    }
    
    return res.status(200).send(new ApiResponse(200, null, "Error deleted successfully!"));
});



const getUserPosts = asyncHandler(async (req, res) => {

});



export {
    createPost,
    updatePost,
    deletePost,
    getUserPosts
}