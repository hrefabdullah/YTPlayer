import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
dotenv.config()

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true // doesn't work with "*" origin
}))

app.use(express.json({ 
    limit: '12kb' 
})) // json data

app.use(express.urlencoded({ 
    extended: true, 
    limit: '16kb' 
})) // form submission data
 
app.use(express.static('public'))
// app.use('/static', express.static("public"));  - to serve static files under URL prefix

app.use(cookieParser())


// Routes declaration
import userRouter from './routes/user.routes.js'

app.use('/api/v1/users', userRouter)

export { app }