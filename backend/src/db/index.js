const mongoose = require('mongoose');
const {
    DB_NAME
} = require('../constants.js');

// Function to connect with MONGODB
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Cannot connect to mongodb", error);
        process.exit(1)
    }
}

module.exports = {
    connectDB
}