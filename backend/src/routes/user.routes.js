const { Router } = require("express");
const { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, updateAvatar, updateCoverImage, getCurrentUser, updateAccountDetails, getUserChannelProfile, getWatchHistory } = require("../controllers/user.controller.js");
const { upload } = require("../middlewares/multer.middleware.js");
const { verifyJwt } = require("../middlewares/auth.middleware.js")

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

router.route("/login").post(loginUser);

// Secured Routes
router.route("/logout").post(
    verifyJwt,
    logoutUser);

router.route("/getUser").get(verifyJwt, getCurrentUser);

router.route("/refreshToken").post(refreshAccessToken);

router.route("/updateAccountDetails").patch(verifyJwt, updateAccountDetails)

router.route("/changePassword").post(verifyJwt, changeCurrentPassword);

router.route("/changeAvatar").patch(verifyJwt, upload.single("avatar"), updateAvatar);

router.route("/changeCoverImage").patch(verifyJwt, upload.single("coverImage"), updateCoverImage);

router.route("/c/:username").get(verifyJwt, getUserChannelProfile);

router.route("/history").get(verifyJwt, getWatchHistory);

module.exports = router;