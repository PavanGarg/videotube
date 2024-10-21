import mongoose from "mongoose"
async function connectdb() {

    try {

        await mongoose.connect('mongodb+srv://pawan_user:pawan234@database.5ko1f.mongodb.net/my_db');
        console.log(process.env.PORT);
        // await mongoose.connect('${process.env.URI}/{DBNAME}');

        console.log('MONGODB connected');

    } catch (error) {
        console.log("MONGO_DB connection Error", error);

    }

}

export default connectdb;




/* this can be written directly in index.js for database connection
import express from express
const app = express()


(async = ()=>{

    try{
        await mongoose.connect('${process.env.MONGODB_URI}/${db_name}');

        app.on("error", (error)=>{

            console.log("err",error);
            throw error;

        })
        app.listen(process.env.PORT , ()=>{

            console.log('APP is listening on port ${process.env.PORT}');
        })
    }
    catch(error){
        console.error("ERROR:",error);
        throw err;
    }
}) */