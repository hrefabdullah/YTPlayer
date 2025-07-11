import asyncHandler from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { fileUploader } from '../utils/FileUploader.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const registerUser = asyncHandler(async (req, res) => {

    // Taking input from user
    const { username, email, fullname, password } = req.body

    // Validating user input
    if (
        [username, email, password, fullname].some((fields) => fields.trim() === '')
    ) {
        throw new ApiError(400, 'All fields are required')
    }

    // Checking if User already exists
    const userExist = User.findOne({
        $or: [{ username }, { email }]
    })

    if (userExist) {
        throw new ApiError(409, "User with given username or email alreday exists!")
    }

    // Check for Images, Avatar must
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

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
    const user = User.create({
        fullname,
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