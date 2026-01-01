const { Router } = require("express");

const {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} = require("../controllers/video.controller.js");

const { verifyJwt } = require("../middlewares/auth.middleware.js");
const { upload } = require("../middlewares/multer.middleware.js");

const router = Router();

router.use(verifyJwt);

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            { name: "videoFile", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 },
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

module.exports = router;
