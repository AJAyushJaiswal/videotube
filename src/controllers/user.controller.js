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
        "-password -refreshToken"
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

    // TODO: generate access and refresh tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    
    if(!accessToken || !refreshToken){
        throw new ApiError(500, "Something went wrong!");
    }

    // TODO: store refresh token in user document
    user.refreshToken = refreshToken;
    const updatedUser = await user.save();

    if(!updatedUser){
        throw new ApiError(500, "Something went wrong!");
    }
    
    // TODO: return tokens using secureCookie and a response
    delete updatedUser._doc.password;
    delete updatedUser._doc.refreshToken;

    const options = {
        httpOnly: true,
        secure: true
    }
    
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {user: updatedUser, accessToken, refreshToken}, "User logged in succesfully"));
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
        throw new ApiError(501, "Something went wrong!");
    }

    //TODO: delete accessToken & refreshToken cookies stored on the client
    const options = {
        httpOnly: true,
        secure: true
    }
    
    return res.status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(200, {}, "User logged out");
})