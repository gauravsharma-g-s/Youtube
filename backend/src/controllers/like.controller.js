const mongoose = require("mongoose");
const Like = require("../models/like.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const {
    asyncHandler
} = require("../utils/asyncHandler");

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {
        videoId
    } = req.params;

    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Check if like already exists
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, null, "Video unliked successfully"));
    }

    const like = await Like.create({
        video: videoId,
        likedBy: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, like, "Video liked successfully"));

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {
        commentId
    } = req.params;

    if (!commentId || !mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, null, "Comment unliked successfully"));
    }

    const like = await Like.create({
        comment: commentId,
        likedBy: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, like, "Comment liked successfully"));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {
        tweetId
    } = req.params;

    if (!tweetId || !mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, null, "Tweet unliked successfully"));
    }

    const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, like, "Tweet liked successfully"));
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([{
            $match: {
                likedBy: mongoose.Types.ObjectId(req.user._id),
                video: {
                    $ne: null
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 1,
                likedBy: 1,
                createdAt: 1,
                video: 1
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});


module.exports = {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
};