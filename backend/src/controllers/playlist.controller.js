const mongoose = require("mongoose");
const {
    isValidObjectId
} = mongoose;

const Playlist = require("../models/playlist.model.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const {
    asyncHandler
} = require("../utils/asyncHandler.js");

// Create Playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const {
        name,
        description
    } = req.body

    if (!name || !description)
        throw new ApiError(400, "All fields are mandatory")

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
        videos: []
    })

    if (!playlist)
        throw new ApiError(500, "failed to create Playlist")

    return res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully")
    )

})

// Get all playlists of User
const getUserPlaylists = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const playlists = await Playlist.find({
        owner: userId
    })
        .sort({
            createdAt: -1
        });

    return res.status(200).json(
        new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
})

// Get Playlist
const getPlaylistById = asyncHandler(async (req, res) => {
    const {
        playlistId
    } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    const playlist = Playlist.aggregate([{
        $match: {
            _id: new mongoose.Types.ObjectId(playlistId)
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
            name: 1,
            description: 1,
            videos: 1,
            createdAt: 1,
            updatedAt: 1,
            owner: {
                _id: "$owner._id",
                username: "$owner.username",
                avatar: "$owner.avatar"
            }
        }
    },
    {
        $lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videos"
        }
    }
    ]);

    if (!playlist.length) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(
        new ApiResponse(200, playlist[0], "Playlist fetched successfully")
    );
})

// Add video to Playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {
        playlistId,
        videoId
    } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video id");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Allowing only owner to modify the playlist
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this playlist");
    }

    // prevent duplicates
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(409, "Video is already in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video added to playlist")
    );
});

// Remove Playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {
        playlistId,
        videoId
    } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video id");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this playlist");
    }

    const initialLength = playlist.videos.length;

    playlist.videos = playlist.videos.filter(
        (id) => id.toString() !== videoId
    );

    if (playlist.videos.length === initialLength) {
        throw new ApiError(404, "Video not found in playlist");
    }

    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

// Delete Playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const {
        playlistId
    } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // only owner can delete
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this playlist");
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res.status(200).json(
        new ApiResponse(200, null, "Playlist deleted successfully")
    );
});

// Update Playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const {
        playlistId
    } = req.params;
    const {
        name,
        description
    } = req.body;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    if (!name && !description) {
        throw new ApiError(400, "At least one field is required to update");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // only owner can update
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this playlist");
    }

    let playlistUpdated = false;
    if (name && name.trim() !== playlist.name) {
        playlist.name = name;
        playlistUpdated = true;
    }
    if (description && description.trim() !== playlist.description) {
        playlist.description = description
        playlistUpdated = true;
    }

    if (!playlistUpdated)
        throw new ApiError(400, "Please make proper changes in playlist");
    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    );
});


module.exports = {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};