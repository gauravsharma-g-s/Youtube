const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const corsOption = require('./config/corsOptions');

const app = express();

app.use(cors(corsOption))

app.use(express.json({
    limit: "16kb"
}));
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
})); // Parse the url encoded data
app.use(express.static("public"));
app.use(cookieParser()); // Allow Server to securely set or access cookies from user web browser

// Routes import
const userRouter = require("./routes/user.routes.js")
const playlistRouter = require('./routes/playlist.route.js')
const subscriptionRouter = require("./routes/subscription.route.js")
const videoRouter = require('./routes/video.route.js')
const tweetRouter = require('./routes/tweet.routes.js')
const commentRouter = require('./routes/comment.routes.js')
const likeRouter = require('./routes/like.routes.js')

// Routes
app.use("/api/v1/users", userRouter)
app.use("/api/v1/playlists", playlistRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)

module.exports = app