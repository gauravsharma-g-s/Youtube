const mongoose = require("mongoose");
const {
    isValidObjectId
} = mongoose;

const User = require("../models/user.model.js");
const Subscription = require("../models/subscription.model.js");

const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const {
    asyncHandler
} = require("../utils/asyncHandler.js");

// Toggle subscription: subscribe/unsubscribe
const toggleSubscription = asyncHandler(async (req, res) => {
    const {
        channelId
    } = req.params;
    const subscriberId = req.user._id;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id");
    }

    if (channelId.toString() === subscriberId.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const existing = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    });

    if (existing) {
        await Subscription.findByIdAndDelete(existing._id);
        return res.status(200).json(
            new ApiResponse(200, null, "Unsubscribed successfully")
        );
    }

    const subscription = await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    });

    return res.status(201).json(
        new ApiResponse(201, subscription, "Subscribed successfully")
    );
});

// Get list of subscribers for a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {
        channelId
    } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id");
    }

    const userChannel = await User.findById(channelId);
    if (!userChannel) {
        throw new ApiError(404, "Channel not found");
    }

    const subscribers = await Subscription.aggregate([{
        $match: {
            channel: new mongoose.Types.ObjectId(channelId)
        }
    },
    {
        $lookup: {
            from: "users",
            localField: "subscriber",
            foreignField: "_id",
            as: "subscriber"
        }
    },

    {
        $unwind: "$subscriber"
    },

    {
        $project: {
            _id: 1,
            createdAt: 1,
            subscriber: {
                _id: "$subscriber._id",
                username: "$subscriber.username",
                avatar: "$subscriber.avatar"
            }
        }
    }
    ])

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

// Get list of channels a user has subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {
        subscriberId
    } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber id");
    }

    const user = await User.findById(subscriberId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const channels = await Subscription.aggregate(
        [{
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel"
            }
        },
        {
            $unwind: "$channel"
        },
        {
            $project: {
                _id: 1,
                createdAt: 1,
                channel: {
                    _id: "$channel._id",
                    username: "$channel.username",
                    avatar: "$channel.avatar"
                }
            }
        }
        ]
    )

    return res.status(200).json(
        new ApiResponse(200, channels, "Subscribed channels fetched successfully")
    );
});

module.exports = {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};