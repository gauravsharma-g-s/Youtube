const { Router } = require("express");
const {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike
} = require("../controllers/like.controller.js");
const { verifyJwt } = require("../middlewares/auth.middleware.js");

const router = Router();

// Apply JWT verification to all routes
router.use(verifyJwt);

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

module.exports = router;
