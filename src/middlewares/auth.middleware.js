import { asyncHandler } from "../utils/asyncHandler";
import {ApiError} from '../utils/ApiError';
import jwt from 'jwt';
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace('Bearer ', '');    
    
    if(!token){
        throw new ApiError(401, "Unauthorised request");
    }

    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    
    const user = await User.findById(decodedToken._id).select('-password -refreshToken');
    
    if(!user){
        throw new ApiError(401, "Invalid Access Token");
    }
    
    req.user = user;

    next();
});