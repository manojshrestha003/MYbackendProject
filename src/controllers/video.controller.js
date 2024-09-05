import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { Video } from '../models/Video.model.js';
import { uploadOnCloudinary } from "../utils/claudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const uploadVideo = AsyncHandler(async (req, res) => {
    const { title, description, duration, isPublished } = req.body;

    //video File 
    const videoLocalPath = req.files?.videoFile?.[0]?.path;  
    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }
  //thumbnail file 
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;  
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required");
    }

    // Upload video and thumbnail to Cloudinary
    const videoFile = await uploadOnCloudinary(videoLocalPath);
    if (!videoFile || !videoFile.url) {
        throw new ApiError(500, "Failed to upload video to Cloudinary");
    }
//upload thumbnail to cloudinary 
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail || !thumbnail.url) {
        throw new ApiError(500, "Failed to upload thumbnail to Cloudinary");
    }

    // Create video record in the database
    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration,
        isPublished
    });

    // Fetch created video to confirm creation
    const createdVideo = await Video.findById(video._id);
    if (!createdVideo) {
        throw new ApiError(500, "Failed to fetch created video");
    }

    // Send response
    return res.status(201).json(new ApiResponse(201, createdVideo, "Video created successfully"));
}); 

const updatethumbnail = AsyncHandler(async (req, res) => {
    // Access the uploaded thumbnail path 
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;  
    
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is missing");
    }

    // Upload thumbnail to Cloudinary
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail || !thumbnail.url) {
        throw new ApiError(400, "Error while uploading thumbnail");
    }

    // Update the video record with the new thumbnail URL
    const video = await Video.findByIdAndUpdate(req.video?._id, {
        $set: {
            thumbnail: thumbnail.url
        }
    }, { new: true });

    // Send response
    return res.status(200).json(new ApiResponse(200, video, "Thumbnail updated successfully"));
});

export { uploadVideo ,updatethumbnail};
