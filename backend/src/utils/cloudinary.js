const cloudinary = require("cloudinary").v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storing Image in cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: "youtube",
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath);;
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log("Cannot upload on Cloudinary ", error)
        return null;
    }
}

// Delete Image from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
    try {
        const parts = imageUrl.split("/upload/");
        if (parts.length < 2) return null;

        const pathWithVersion = parts[1];
        const pathWithOutVersion = pathWithVersion.replace(/^v\d+\//, "");
        const publicId = pathWithOutVersion.replace(/\.[^/.]+$/, "");
        if (!publicId) return null;
        await cloudinary.uploader.destroy(publicId)
    } catch (error) {
        console.log("Error deleting from Cloudinary ", error)
        return null;
    }
}

module.exports = {
    uploadOnCloudinary,
    deleteFromCloudinary
}