import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from '../utils/ApiError.js';

// tested using postman -- working properly
const healthCheck = asyncHandler(async (req, res) => {
    try{
        res.status(200).json(new ApiResponse(200, null, "Health check successfull!"));
    }
    catch(error){
        throw new ApiError(500, "Health check failed!");
    }
});


export {healthCheck}
