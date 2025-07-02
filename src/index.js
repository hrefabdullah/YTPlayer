import express from 'express'
import dotenv from 'dotenv'
import connectDB from './db/connectDB.js';
dotenv.config({})

const app = express()

app.listen(process.env.PORT, () => {
    connectDB()
    console.log(`Server is running on port: ${process.env.PORT}`)
})



















// ;( async () => {
//     try {
//         const con = await mongoose.connect(`${process.env.MONGO_URL}/${DBName}`)
//         console.log(con)
//         app.on('Error', (err) => {
//             console.log('unable: ', err)
//         })

//         app.listen(process.env.PORT, () => {
//             console.log("server running")
//         }) 
//     } catch (error) {
//         console.error("Error: ", error)
//     }
// })()