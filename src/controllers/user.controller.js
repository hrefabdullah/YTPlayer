import path from 'path'
import asyncHandler from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { fileUploader } from '../utils/FileUploader.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import removeLocalFiles from '../utils/removeLocalFiles.js'


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        if (!user) {
            throw new ApiError(404, "User not found during token generation")
        }

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        console.error("Token Generation Failed:", error) // <--- LOG IT
        throw new ApiError(500, "Error while Generating Access or Refresh token")
    }
}




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

const loginUser = asyncHandler( async (req, res) => {
    
    // Take input from user
    const { email, username, password } = req.body

    if( !username || !email ){
        throw new ApiError(400, 'username or email is required')
    }

    // Check if user with email or username exists
    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if(!user){
        throw new ApiError(404, 'User does not exists')
    }

    // Validate password
    const isPassCorrect = await user.isPasswordCorrect(password)

    if(!isPassCorrect){
        throw new ApiError(401, 'Invalid user credentials')
    }

    // generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(" -password -refreshToken")

    // Cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options )
    .json(
        new ApiResponse( 200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in SuccessFully"
        )
    )



})

const logoutUser = asyncHandler( async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "Logged out successfully" });
})

const refreshAccessToken = asyncHandler( async(req, res) => {

    try {
        const incomingToken = req.cookie.refreshToken || req.body.refreshToken
    
        if(!incomingToken){
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(
            incomingToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, 'Invalid refresh token')
        }
    
        if( incomingToken !== user?.refreshToken ){
            throw new ApiError(401, "Refresh token is dead")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken: newRefreshToken },
                "Cookies updated"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || 'invalid refresh token')
    }

})

const changeCurrentPassword = asyncHandler( async(req, res) => {
    const { oldPass, newPass } = req.body

    const user = await User.findById(req.user?._id)
    const isPassCorrect = await user.isPassCorrect(oldPass)

    if(!isPassCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPass
    await user.save({ validateBeforeSave: false })

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Password changed successfully!")
    )

})

const getCurrentUser = asyncHandler( async(req, res) => {
    return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully!")
})

const updateAccDetails = asyncHandler( async(req, res) => {
    const { fullName, email } = req.body

    if(!fullName && !email){
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Updated successfully!")
    )
})

const updateAvatar = asyncHandler( async(req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await fileUploader(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    removeLocalFiles( avatarLocalPath )

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Avatar updated successfully")
    )


})

const updateCoverImg = asyncHandler( async(req, res) => {
    const coverImgLocalPath = req.file?.path

    if(!coverImgLocalPath){
        throw new ApiError(400, "Cover image is missing")
    }

    const coverImage = await fileUploader(coverImgLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading Cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    removeLocalFiles( coverImgLocalPath )

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Cover image updated successfully")
    )


})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccDetails,
    updateAvatar,
    updateCoverImg
}