const mongoose = require("mongoose");
const Tweet = require("../models/tweet.model.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const {
    asyncHandler
} = require("../utils/asyncHandler.js");

const createTweet = asyncHandler(async (req, res) => {
    const {
        content
    } = req.body;

    if (!content || !content?.trim())
        throw new ApiError(400, "Please enter content");

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user?._id
    })

    if (!tweet)
        throw new ApiError(500, "Cannot create tweet")

    return res.status(201).json(
        new ApiResponse(201, tweet, "Tweet created succesfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.params;
    if (!userId || !mongoose.isValidObjectId(userId))
        throw new ApiError(400, "Please check UserId");
    const tweets = await Tweet.aggregate([{
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
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
                owner: {
                    _id: "$owner._id",
                    fullName: "$owner.fullName",
                    avatar: "$owner.avatar"
                }
            }
        }
    ])

    if (tweets.length === 0)
        throw new ApiError(404, "No tweets found");

    return res.status(200).json(
        new ApiResponse(200, tweets, "Tweets fetched succesfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    const {
        tweetId
    } = req.params;
    const {
        content
    } = req.body;

    if (!tweetId || !mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this tweet");
    }

    if (!content || !content.trim()) {
        throw new ApiError(400, "Content cannot be empty");
    }

    if (content.trim() === tweet.content) {
        throw new ApiError(400, "No changes detected");
    }

    tweet.content = content.trim();
    await tweet.save();

    return res.status(200).json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    );
});


const deleteTweet = asyncHandler(async (req, res) => {
    const {
        tweetId
    } = req.params;

    if (!tweetId || !mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this tweet");
    }

    await tweet.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, null, "Tweet deleted successfully")
    );
});



module.exports = {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};