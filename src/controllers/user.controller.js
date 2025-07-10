import asyncHandler from '../utils/asyncHandler.js'

const registerUser = asyncHandler( async (req, res) => {
    const respo = res.status(200).json({
        message: 'ok'
    })
    res.send("Hi")
    console.log(respo)
    return respo
})

export default registerUser