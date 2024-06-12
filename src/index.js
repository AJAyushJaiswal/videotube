// require('dotenv').config(); // works -> loads .env variables from .env file
// import 'dotenv/config'; //works -> loads .env variables from .env file
import dotenv from 'dotenv'; // works -> loads .env variables from .env file
// dotenv.config({path: '.env'}); // path is optional
// dotenv.config({path: ['.env', '.env.production']}); // loads env. variables from multiple files
dotenv.config();

import connectDB from './db/index.js';
import {app} from './app.js';


connectDB()
.then(() => {
    app.on('error', (error) => {
        console.log('ERROR: ', error);
        process.exit(1);
    })

    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log('MONGODB connection failed !!!', error);
    process.exit(1);
})





/*
import mongoose from 'mongoose';
import {DB_NAME} from "./constants";
import express from 'express';
const app = express();

;(async () => {
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       app.on("error", (error) => {
        console.log("ERROR: ", error);
       })
        
       app.listen(process.env.PORT, () => {
        console.log(`app is listening on port ${process.env.port}`);
       })
    }catch(error){
        console.log("ERROR: ", error);
        throw error;
    }
})();
*/