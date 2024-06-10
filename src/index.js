// require('dotenv').config(); // works
// import 'dotenv/config'; //works 
import dotenv from 'dotenv'; // works
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