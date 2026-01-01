const { Router } = require("express");
const {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment
} = require("../controllers/comment.controller.js");
const {  verifyJwt } = require("../middlewares/auth.middleware.js");

const router = Router();

// Apply JWT verification to all routes
router.use(verifyJwt);

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

module.exports = router;
