import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {Video} from '../models/video.model.js';
import {Like} from '../models/like.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {Comment} from '../models/comment.model.js';
import {Post} from '../models/post.model.js';


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    if(!videoId){
        throw new ApiError(404, "Video to like not found!");
    }

    const videoExists = await Video.exists({_id: videoId});
    if(!videoExists){
        throw new ApiError(404, "Video to like not found!");
    }

    const videoLiked = await Like.exists({video: videoId, likedBy: req.user._id}); 

    if(videoLiked){
        const removeLike = await Like.findByIdAndDelete({_id: videoLiked._id}).lean();
        if(!removeLike){
            throw new ApiError(400, "Error liking the video!");
        }
        return res.status(200).json(new ApiResponse(200, null, "Liked removed successfully!"));
    }

    const addLike = await Like.create({video: videoId, likedBy: req.user._id}).lean();
    if(!addLike){
        throw new ApiError(400, "Error liking the video!");
    }
    
    return res.status(200).json(new ApiResponse(200, null, "Video liked successfully!"));
});



const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    if(!commentId){
        throw new ApiError(400, "Error liking the comment!");
    }
    
    const commentExists = await Comment.exists({_id: commentId}); 
    if(!commentExists){
        throw new ApiError(400, "Error liking the comment!");
    }
    
    const commentLiked = await Like.exists({comment: commentId, likedBy: req.user._id});
    
    if(commentLiked){
        const removeLike = await Like.findOneAndDelete({_id: commentLiked._id}).lean();
        if(!removeLike){
            throw new ApiError(400, "Error removing like from the comment!")
        }
        
        return res.status(200).json(new ApiResponse(200, null, "Like removed successfully!"));
    }

    const addLike = await Like.create({comment: commentId, likedBy: request.user._id}).lean();
    if(!addLike){
        throw new ApiError(400, "Error liking the comment!");
    }
    
    return res.status(200).json(new ApiResponse(200, null, "Comment liked successfully!"));
});



const togglePostLike = asyncHandler(async (req, res) => {
    const {postId} = req.params;
    if(!postId){
        throw new ApiError(404, "Error liking the post!");
    }

    const postExists = await Post.exists({_id: postId});
    if(!postExists){
        throw new ApiError(404, "Error liking the post!");
    }
    
    const postLiked = await Like.exists({post: postId, likedBy: req.user._id}); 

    if(postLiked){
        const removedLike = await Like.findOneAndDelete({_id: postLiked._id}).lean();
        if(!removedLike){
            throw new ApiError(400, "Error removing like from the post!");
        } 
        return res.status(200).json(new ApiResponse(200, null, "Like removed successfully!"));
    }
    
    const addLike = await Like.create({post: postId, likedBy: req.user._id}).lean();
});



const getLikedVideos = asyncHandler(async (req, res) => {
/*     const likedVideos = await User.aggregate([
        {
            $match: {
                _id: req.user._id
            }
        },
        {
            $Lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'likedBy',
                as: 'likes',
                pipeline: [
                    {
                        $lookup: {
                            from: 'videos',
                            localField: 'video',
                            foreignField: '_id',
                            as: 'video'
                        }
                    }
                ]
            }
        }
    ]); */
});



export {
    toggleVideoLike,
    toggleCommentLike,
    togglePostLike,
    getLikedVideos
}