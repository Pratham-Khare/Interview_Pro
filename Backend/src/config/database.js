import mongoose from "mongoose";

/**
 * @name connectToDB
 * @description Establishes a connection to the MongoDB database using
 *              the configured connection URI.
 */
async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to Database");
    } catch (err) {
        console.log(err);
    }
}

export default connectToDB;