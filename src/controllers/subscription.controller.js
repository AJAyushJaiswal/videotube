import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {Subscription} from '../models/subscription.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';



const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if(!channelId){
        throw new ApiError(404, "ChannelId is required!");
    } 

    const channel = await User.exists({_id: channelId});
    if(!channel){
        throw new ApiError(404, "Channel not found!");
    }
    
    if(channelId === req.user._id){
        throw new ApiError(400, "Can't subscribe to your own channel!");        
    }
    
    const subscriptionExists = await Subscription.exists({channel: channelId, subscriber: req.user._id});
    
    if(subscriptionExists){
        const removedSubscription = await Subscription.findOneAndDelete({channel: channelId, subscriber: req.user._id});
        if(!removedSubscription){
            throw new ApiError(400, "Error unsubscribing to this channel!");
        }
        return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully!"));
    }
    
    const subscription = await Subscription.create({channel: channelId, subscriber: req.user._id}).lean();
});



