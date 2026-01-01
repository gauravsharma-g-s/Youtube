const mongoose = require("mongoose");
const {
    isValidObjectId
} = mongoose;

const Video = require("../models/video.model.js");
const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const {
    asyncHandler
} = require("../utils/asyncHandler.js");
const {
    uploadOnCloudinary,
    deleteFromCloudinary
} = require("../utils/cloudinary.js");

// GET all videos with query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
    let {
        page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId
    } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const match = {};
    if (query) match.title = {
        $regex: query,
        $options: "i"
    };
    if (userId && isValidObjectId(userId)) match.owner = mongoose.Types.ObjectId(userId);

    const sort = {};
    sort[sortBy] = sortType === "asc" ? 1 : -1;

    const aggregate = Video.aggregate([{
        $match: match
    }]);
    const options = {
        page,
        limit,
        sort,
        populate: {
            path: "owner",
            select: "username avatar"
        }
    };

    const result = await Video.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, result, "Videos fetched successfully")
    );
});

// PUBLISH a video (upload to cloudinary + create video)
const publishAVideo = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        duration
    } = req.body;

    if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }

    if (!title || !description || !duration) {
        throw new ApiError(400, "Title, description, and duration are required");
    }

    // Upload video file
    const videoFileLocalPath = req.files?.videoFile[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    if (!videoFileLocalPath || !thumbnailLocalPath)
        throw new ApiError(400, "Video and Thumbnail are required")
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    const video = await Video.create({
        title,
        description,
        duration,
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url,
        owner: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(201, video, "Video published successfully")
    );
});

// GET video by ID
const getVideoById = asyncHandler(async (req, res) => {
    const {
        videoId
    } = req.params;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    // const video = await Video.findById(videoId).populate("owner", "username avatar");
    const video = await Video.aggregate(
        [{
                $match: {
                    _id: mongoose.Types.ObjectId(videoId)
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
                    videoFile: 1,
                    thumbnail: 1,
                    description: 1,
                    title: 1,
                    duration: 1,
                    views: 1,
                    owner: {
                        username: "$owner.username",
                        avatar: "$owner.avatar"
                    }
                }
            }
        ]
    )

    if (!video) throw new ApiError(404, "Video not found");

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});

// UPDATE video details (only owner)
const updateVideo = asyncHandler(async (req, res) => {
    const {
        videoId
    } = req.params;
    const {
        title,
        description
    } = req.body;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this video");
    }

    let updated = false;

    if (title && title.trim() !== video.title) {
        video.title = title.trim();
        updated = true;
    }
    if (description && description.trim() !== video.description) {
        video.description = description.trim();
        updated = true;
    }

    if (req.file) {
        const thumbnailLocalPath = req.file.path;
        if (video.thumbnail)
            await deleteFromCloudinary(video.thumbnail);
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        video.thumbnail = thumbnail.url;
        updated = true;
    }


    if (!updated) throw new ApiError(400, "No changes detected");

    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, "Video updated successfully")
    );
});

// DELETE video (only owner)
const deleteVideo = asyncHandler(async (req, res) => {
    const {
        videoId
    } = req.params;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video?.owner?.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this video");
    }

    await video.remove();

    return res.status(200).json(
        new ApiResponse(200, null, "Video deleted successfully")
    );
});

// TOGGLE publish status
const togglePublishStatus = asyncHandler(async (req, res) => {
    const {
        videoId
    } = req.params;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video?.owner?.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this video");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, `Video is now ${video.isPublished ? "published" : "unpublished"}`)
    );
});

module.exports = {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};