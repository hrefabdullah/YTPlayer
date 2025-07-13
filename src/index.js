import dotenv from 'dotenv'
dotenv.config({
    path: './.env'
})
import connectDB from './db/connectDB.js';
import { app } from './app.js';

app.listen(process.env.PORT || 3000, async () => {
    try {
        await connectDB()
    } catch (error) {
        console.error('DB connection failed', error)
    }
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