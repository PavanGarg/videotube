// require('dotenv').config({path: './env'})
import dotenv from "dotenv";

import connectdb from "./db/connect.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

connectdb()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log('server is connected at port ${process.env.PORT}');
    })
})
.catch((err)=>{
    console.log("mongodb connection error",err);
    
})