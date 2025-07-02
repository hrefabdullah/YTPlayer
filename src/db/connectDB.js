import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { DBName } from '../constants.js'
dotenv.config()

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/${DBName}`)
    } catch (error) {
        console.error(error);
        process.exit(1)
    }
}

export default connectDB