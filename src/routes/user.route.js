import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { changePassword, getCurrentUser, getUserChannelProfile, getwatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updataAvatar, updateAccountDetails, updateCoverImage } from '../controllers/user.controller.js';
import { updatethumbnail, uploadVideo } from '../controllers/video.controller.js';



//Define Routes for different components 
const router = Router();

router.route('/register').post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]),
    registerUser
);
router.route('/login').post(loginUser)
router.route('/logout').post( logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(changePassword)
router.route('/current-user').get(getCurrentUser)
router.route('/chnageDetails').patch(updateAccountDetails)
router.route('/update-avater ').patch(upload.single("avatar", updataAvatar))
router.route('/update-coverImage').patch(upload.single("coverImage"), updateCoverImage)
router.route('/c/:username').get(getUserChannelProfile)
router.route('/watchHistory').get(getwatchHistory)

router.post('/videos',
    upload.fields([
        { name: 'videoFile', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ]),
    uploadVideo
);
router.route('/update-thumbnail').patch(upload.single("thumbnail", updatethumbnail))
   


export default router;
