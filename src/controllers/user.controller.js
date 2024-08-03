import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend 
    // validation - not empty 
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response 
    // check for user creation
    // return response
    
    const {username, email, fullName, password} = req.body;
    
    if([username, email, fullName, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }

    const userAlreadyExists =  await User.findOne({
        $or: [{username}, {email}]
    });

    
    if(userAlreadyExists){
        throw new ApiError(409, "User with email or username already exists");
    }
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;  
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    
    console.log(avatar);
    console.log(coverImage);
    
    if(!avatar){
        throw new ApiError(400, "Avatar file is required");
    }
    
    const user = await User.create({username: username.toLowerCase(), email, fullName, avatar: avatar.url, coverImage: coverImage?.url || "", password});

    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    
    if(!userCreated){
        throw new ApiError(500, "Something went wrong while registering the user");
    }
    
    return res.status(201).json(
        new ApiResponse(201, userCreated, "User registered successfully!")
    );
});