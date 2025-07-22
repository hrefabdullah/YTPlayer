import { Router } from "express";
import  { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccDetails, updateCoverImg, updateAvatar, getUserChannelProfile, getHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/register').post( 
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser 
)

router.route('/login').post(loginUser)

// Secure
router.route('/logout').post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route('/changePassword').post(verifyJWT, changeCurrentPassword)
router.route('/userDetails').get(verifyJWT, getCurrentUser)
router.route('/updateAccount').patch(verifyJWT, updateAccDetails)
router.route('/updateAvatar').patch(verifyJWT, upload.single('avatar'), updateAvatar)
router.route('/updateCoverImage').patch(verifyJWT, upload.single('coverImage'), updateCoverImg)
router.route('/c/:username').get(verifyJWT, getUserChannelProfile)
router.route('/history').get(verifyJWT, getHistory)

export default router