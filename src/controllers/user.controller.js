import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';


const generateAccessAndRefreshTokens = async (userId) => {
    try{
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        
        return {accessToken, refreshToken};
    }
    catch(error){
        throw new ApiError(500, "Error generating access and refresh tokens");
    }
}


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
    
    if([username, email, fullName, password].some((field) => field?.trim() === "") || !req.files.avatar){
        throw new ApiError(400, "All fields are required");
    }


    const userAlreadyExists =  await User.findOne({
        $or: [{username}, {email}]
    });
    
    if(userAlreadyExists){
        throw new ApiError(409, "User with email or username already exists");
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;  
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }
    

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    
    if(!avatar){
        throw new ApiError(400, "Avatar file is required");
    }

    
    const user = await User.create({username: username.toLowerCase(), email, fullName, avatar: avatar.url, coverImage: coverImage?.url || "", password});

    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken -updatedAt"
    );
    
    if(!userCreated){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    
    return res.status(201).json(
        new ApiResponse(201, userCreated, "User registered successfully!")
    );
});



export const loginUser = asyncHandler(async (req, res) => {
    // TODO: check if username or email is present in request
    const {email, username, password} = req.body;

    if(!(username || email)){
        throw new ApiError(400, "username or email required");
    }
    
    if(!password){
        throw new ApiError(400, "password is required");
    }

    // TODO: check if user exists with the given email or username
    const user = await User.findOne({
        $or: [{username}, {email}]
    });

    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    // TODO: check if the password is correct
    if(!user.isPasswordCorrect(password)){
        throw new ApiError(401, "Invalid user credentials");
    } 

    // TODO: generate access and refresh tokens and store refreshToken in database
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);  

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -updatedAt");
    
    // TODO: return tokens using secureCookie and a response
    const options = {
        httpOnly: true,
        secure: true
    }
    
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {user: loggedInUser, accessToken, refreshToken}, "User logged in succesfully"));
});



export const logoutUser = asyncHandler( async (req, res) => {
    //TODO: get user from request and reset refreshToken of user in the database - (user has been added to req object by verifyJWT middleware)
    const updatedUser = await User.findByIdAndUpdate(req.user._id, 
        {
            $set: {refreshToken: ''}
        },
        { new: true}
    );
    
    if(!updatedUser){
        throw new ApiError(500, "Something went wrong!");
    }

    //TODO: delete accessToken & refreshToken cookies stored on the client
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, null, "User logged out"));
});



export const refreshAccessToken = asyncHandler(async (req, res) => {
    try{
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        
        if(!incomingRefreshToken){
            throw new ApiError(401, "Unauthorised request");
        }


        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        if(!decodedToken){
            throw new ApiError(401, "Invalid refresh token");
        }

        
        const user = await User.findById(decodedToken?._id);
       
        if(!user){
            throw new ApiError(401, "Invalid refresh token");
        }

        
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401, "Invalid refresh token");
        }
         
        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(user._id);


        const options = {
            httpOnly: true,
            secure: true
        }
        
        res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access token refreshed"));
    }
    catch(error){
        throw new ApiError(500, "Error during refreshing access token");
    }
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword, confirmPassword} = req.body;

    if(!oldPassword || !newPassword || !confirmPassword){
        throw new ApiError(401, "All fields are required");
    }
    
    if(newPassword !== confirmPassword){
        throw new ApiError(401, "New password and confirm password don't match");
    }
    

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid old password");
    }
    

    user.password = newPassword;
    const updatedUser = await user.save({validateBeforeSave: false});
    
    if(!updatedUser){
        throw new ApiError(500, "Password update failed");
    }


    res.status(200).json(new ApiResponse(200, null, "Password updated successfuly"));    
});


export const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, {user: req.user}, "Current user fetched successfully"));
});


export const updateAccountDetails = asyncHandler(async (req, res) => {
    const {email, fullName} = req.body;
    
    if(!fullName || !email){
        throw new ApiError(400, "All fields are required");
    }
    

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id, 
        {
            $set: {
                email, 
                fullName
            }
        }, 
        {new: true}
    ).select("-password -refreshToken -updatedAt");
    
    if(!updatedUser){
        throw new ApiError(500, "Failed to update account details");
    }
    
    return res.status(200).json(new ApiResponse(200, {user: updatedUser}, "Account details updated successfully"));
});


export const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing");
    }
    

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    
    if(!avatar.url){
        throw new ApiError(500, "Error while uplaoding avatar");
    }
    

    const oldAvatar = req.user.avatar;

    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password -refreshToken -updatedAt");
    

    res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
});


export const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    
    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover image file is missing");
    }
    

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    
    if(!coverImage.url){
        throw new ApiError(500, "Error while uplaoding cover image");
    }
    

    const oldCoverImage = req.user.coverImage;

    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password -refreshToken -updatedAt");


    res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully"));
});