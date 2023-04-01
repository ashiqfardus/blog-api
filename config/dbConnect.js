const mongoose = require('mongoose');

//function to connect

const dbConnect = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`Mongo DB Connected`);
    }
    catch (error){
        console.log(error.message);
        process.exit(1);
    }
}

// dbConnect();
module.exports = dbConnect;