import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;
        
        // upload the file on cloudinary 
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });

        
        // file has been uploaded successfully
        // console.log('file has been uploaded on cloudinary', response.url);
        fs.unlinkSync(localFilePath);
        
        return response;
    } 
    catch(error){
        console.log(error);
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation failed

        return null;
    }
}


const deleteFromCloudinary = async (url, resource_type='image') => {
    try{
        if(!url) return null;
        // "http://res.cloudinary.com/cloudburst/image/upload/v1722673407/dgt4h8zknlcmv9ujmu9v.jpg"
        // "http://res.cloudinary.com/{process.env.CLOUDINARY_CLOUD_NAME}/{resource_type}/{type}/  /{public_id}.extension"

        const publicId = url.substring(url.lastIndexOf('/')+1).split('.')[0];

        const fileDeleted = await cloudinary.uploader.destroy(publicId, {resource_type});
        
        if(!fileDeleted || (fileDeleted.result !== 'ok' && fileDeleted.result !== 'not found')){
            throw new Error('Error deleting file from cloudinary!');
        }

        return fileDeleted;
    }
    catch(error){
        console.log(error);
        return null;
    }
};


export {uploadOnCloudinary, deleteFromCloudinary}