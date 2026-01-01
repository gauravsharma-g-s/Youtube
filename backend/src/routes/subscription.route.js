const {
    Router
} = require("express");

const {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} = require("../controllers/subscription.controller.js");

const {
    verifyJwt
} = require("../middlewares/auth.middleware.js");

const router = Router();
router.use(verifyJwt); 

// Routes
router
    .route("/c/:channelId")
    .get(getSubscribedChannels)
    .post(toggleSubscription);

router.route("/u/:subscriberId").get(getUserChannelSubscribers);

module.exports = router;