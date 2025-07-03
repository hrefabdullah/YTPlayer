import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { DBName } from '../constants.js'
dotenv.config()

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGO_URL}/${DBName}`)
        console.log("DB connected on host: ", conn.connection.host)
    } catch (error) {
        console.error(error);
        process.exit(1)
    }
}

export default connectDB