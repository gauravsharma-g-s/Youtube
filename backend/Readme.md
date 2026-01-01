# YouTube Backend

A fully-featured backend for a YouTube-like platform built with **Node.js**, **Express**, **Mongoose** and **MongoDB**. This project allows users to upload videos, manage playlists, like content, comment, and subscribe to channels. It is designed to be modular, scalable, and production-ready.

---

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [API Endpoints](#api-endpoints)
- [Setup & Installation](#setup--installation)
- [Folder Structure](#folder-structure)
- [Error Handling](#error-handling)
- [Notes](#notes)
- [Author](#author)

---

## Features

- **User Management**
  - JWT-based authentication and authorization.
  - Secure routes with `verifyJWT` middleware.

- **Video Management**
  - Upload videos and thumbnails.
  - CRUD operations: Create, Read, Update, Delete videos.
  - Toggle publish/unpublish status.
  - Pagination, search, and sorting using aggregation pipelines.

- **Playlist Management**
  - Create playlists with multiple videos.
  - Add/remove videos from playlists.
  - Owner-only updates and deletions.
  - Aggregation pipelines to populate playlist videos and owner details.

- **Comment System**
  - Add, update, delete comments on videos.
  - Pagination for comments.
  - Aggregation pipelines to populate comment owner details.

- **Like System**
  - Like/unlike videos, comments, and tweets.
  - Fetch all liked videos by a user using aggregation pipelines.

- **Subscription System**
  - Subscribe/unsubscribe to channels.
  - Fetch subscriber lists and channels a user has subscribed to.

- **Cloudinary Integration**
  - Video and thumbnail uploads handled via Cloudinary.
  - Automatically deletes old media on update.

- **Error Handling & Responses**
  - `ApiError` for structured errors.
  - `ApiResponse` for consistent JSON responses.
  - `asyncHandler` to handle async route errors.

---

## Technologies

- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **File Upload:** Multer + Cloudinary
- **Authentication:** JWT
- **Pagination:** mongoose-aggregate-paginate-v2
- **Others:** Aggregation pipelines, async/await, modular architecture

---

## API Endpoints

### **Users**
- `POST /api/v1/users/register` – Register a new user
- `POST /api/v1/users/login` – Login a user
- `POST /api/v1/users/logout` – Logout current user
- `POST /api/v1/users/refreshToken` – Refresh access token

- `GET /api/v1/users/getUser` – Get currently logged-in user
- `PATCH /api/v1/users/updateAccountDetails` – Update user account details
- `POST /api/v1/users/changePassword` – Change current user password
- `PATCH /api/v1/users/changeAvatar` – Update user avatar
- `PATCH /api/v1/users/changeCoverImage` – Update user cover image

- `GET /api/v1/users/c/:username` – Get user channel profile by username
- `GET /api/v1/users/history` – Get watch history of logged-in user


### **Tweets**
- `POST /api/v1/tweets/` – Create a new tweet
- `GET /api/v1/tweets/user/:userId` – Get all tweets by a specific user
- `PATCH /api/v1/tweets/:tweetId` – Update a tweet
- `DELETE /api/v1/tweets/:tweetId` – Delete a tweet

### **Videos**
- `POST /api/v1/videos/` – Upload a new video with thumbnail
- `GET /api/v1/videos/` – Get all videos with pagination, search, and sort
- `GET /api/v1/videos/:videoId` – Get video by ID
- `PATCH /api/v1/videos/:videoId` – Update video details or thumbnail
- `DELETE /api/v1/videos/:videoId` – Delete a video
- `PATCH /api/v1/videos/toggle/publish/:videoId` – Toggle publish/unpublish status

### **Playlists**
- `POST /api/v1/playlists/` – Create a playlist
- `GET /api/v1/playlists/:playlistId` – Get playlist by ID
- `PATCH /api/v1/playlists/:playlistId` – Update playlist
- `DELETE /api/v1/playlists/:playlistId` – Delete playlist
- `PATCH /api/v1/playlists/add/:videoId/:playlistId` – Add video to playlist
- `PATCH /api/v1/playlists/remove/:videoId/:playlistId` – Remove video from playlist
- `GET /api/v1/playlists/user/:userId` – Get all playlists of a user

### **Comments**
- `GET /api/v1/comments/:videoId` – Get all comments for a video
- `POST /api/v1/comments/:videoId` – Add a comment to a video
- `PATCH /api/v1/comments/c/:commentId` – Update a comment
- `DELETE /api/v1/comments/c/:commentId` – Delete a comment

### **Likes**
- `POST /api/v1/likes/toggle/v/:videoId` – Like/unlike a video
- `POST /api/v1/likes/toggle/c/:commentId` – Like/unlike a comment
- `POST /api/v1/likes/toggle/t/:tweetId` – Like/unlike a tweet
- `GET /api/v1/likes/videos` – Get all liked videos by the logged-in user

### **Subscriptions**
- `POST /api/v1/subscriptions/c/:channelId` – Subscribe/unsubscribe to a channel
- `GET /api/v1/subscriptions/c/:channelId` – Get all subscribers of a channel
- `GET /api/v1/subscriptions/u/:subscriberId` – Get all channels a user has subscribed to

---

## Setup

**Clone the repository**

```bash
git clone https://github.com/gauravsharma-g-s/Youtube.git
cd backend
npm install
npm run dev

