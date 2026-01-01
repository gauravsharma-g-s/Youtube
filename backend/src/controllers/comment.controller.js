const mongoose = require("mongoose");
const Comment = require("../models/comment.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const {
    asyncHandler
} = require("../utils/asyncHandler");

const getVideoComments = asyncHandler(async (req, res) => {
    const {
        videoId
    } = req.params
    const {
        page = 1, limit = 10
    } = req.query

    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const aggregate = Comment.aggregate([{
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                owner: {
                    _id: "$owner._id",
                    username: "$owner.username",
                    avatar: "$owner.avatar"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    const options = {
        page,
        limit
    };

    const result = await Comment.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, result, "Comments fetched successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
    const {
        videoId
    } = req.params;
    const {
        content
    } = req.body;

    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content cannot be empty");
    }

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(201, comment, "Comment added successfully")
    );
})

const updateComment = asyncHandler(async (req, res) => {
    const {
        commentId
    } = req.params;
    const {
        content
    } = req.body;

    if (!commentId || !mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content cannot be empty");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this comment");
    }

    comment.content = content.trim();
    await comment.save();

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
})

const deleteComment = asyncHandler(async (req, res) => {
    const {
        commentId
    } = req.params;

    if (!commentId || !mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this comment");
    }

    await comment.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, null, "Comment deleted successfully")
    );
})

module.exports = {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};