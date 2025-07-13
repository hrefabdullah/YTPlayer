import path from 'path'
import asyncHandler from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { fileUploader } from '../utils/FileUploader.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const registerUser = asyncHandler(async (req, res) => {

    console.log(req.files)
    console.log(req.body)
    console.log('Cloudinary Key:', process.env.CLOUD_KEY)

    // Taking input from user
    const { username, email, fullName, password } = req.body

    // Validating user input
    if (
        [username, email, password, fullName].some((fields) => fields === '')
    ) {
        throw new ApiError(400, 'All fields are required')
    }

    // Checking if User already exists
    const userExist = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (userExist) {
        throw new ApiError(409, "User with given username or email already exists!")
    }

    // Check for Images, Avatar must

    // Normalize the Windows backslashes to safe format
    const avatarLocalPath = req.files?.avatar?.[0]?.path
        ? path.normalize(req.files.avatar[0].path)
        : null

    let coverImageLocalPath
    if( req.files && Array.isArray( req.files.coverImage ) && req.files.coverImage.length < 0){
        coverImageLocalPath = req.files.coverImage.path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    //Upload on cloudinary
    const avatar = await fileUploader(avatarLocalPath)
    const coverImage = await fileUploader(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(409, 'Avatar is not uploaded')
    }

    //Saving data to Database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    //check for user creation
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, 'Internal Server Error')
    }

    // returning response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

export default registerUser