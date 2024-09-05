import { ApiError } from '../utils/ApiError.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { User } from '../models/Users.model.js';
import { uploadOnCloudinary } from '../utils/claudinary.js'; 
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken'

// User Registration
const registerUser = AsyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // Validate required fields
//   if ([fullName, username, email, password].some(field => field?.trim() === "")) {
//     throw new ApiError(400, "All fields are required.");
//       }
if(!fullName ||!username || !email || !password){
        throw new ApiError(400, "All fields are required.");

    }

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        throw new ApiError(409, 'User already exists.');
    }

    // Handle file uploads
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required.");
    }

    
        // Upload files to Cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar) {
            throw new ApiError(500, "Failed to upload avatar to Cloudinary.");
        }

        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path;
        }

        const coverImage = coverImageLocalPath
            ? await uploadOnCloudinary(coverImageLocalPath)
            : { url: "" };

        
        

        // Create user in the database
        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage.url,
            email,
            password, 
            username: username.toLowerCase()
        });

        // Fetch the created user without sensitive information
        const createdUser = await User.findById(user._id).select("-password -refreshToken");
        if (!createdUser) {
            throw new ApiError(500, "Failed to fetch created user.");
        }

        // Return success response
        return res.status(201)
        .json(new ApiResponse(201, createdUser, "User registered successfully."));
    
});

//generate access token and refresh token 
const generateAccessTokenRefreshToken = async (userId) => {
    try {
        // Await the result to get the user instance
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        
        // Generate tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        // Save the refresh token
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        
        return { accessToken, refreshToken };
    } catch (error) {
        // Forward the error
        throw new ApiError(500, "Something went wrong");
    }
};

// Login User 
const loginUser = AsyncHandler(async (req, res) => {
    
    const {username, email , password} = req.body

    

    // Find the user
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) {
        throw new ApiError(401, "User does not exist");
    }

    // Validate password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessTokenRefreshToken(user._id);

    // Exclude sensitive fields
    const loggedUser = await User.findById(user._id).select("-password -refreshToken");

    // Set cookie options
    const options = {
        httpOnly: true,
        secure: true 
    };

    // Respond with cookies and user info
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: loggedUser, 
            accessToken, 
            refreshToken
        }, "User logged in successfully"));
});

const logoutUser = AsyncHandler(async (req, res) => {
    // Update the user's refresh token
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        refreshToken: undefined
      }
    }, {
      new: true
    });
  
    // Set cookie options
    const options = {
      httpOnly: true,
      secure: true 
    
    };
  
    // Clear cookies
    res
      .status(200)
      .cookie("accessToken", "", options)
      .cookie("refreshToken", "", options)
      .json(new ApiResponse(200, {}, "User logged out"));
  });
 //refresh access Token 
  const refreshAccessToken  = AsyncHandler(async (req, res)=>{
    const incomingRefreshToken  = req.cookie.refreshToken  ||req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request ")
    }
    try {
        const decodedToken  = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

       const user = await  User.findById(decodedToken?._id)

     if(!user){
        throw new ApiError(401, "Invalid refresh token ")
     }
     if(incomingRefreshToken!==user?.refreshToken){
        throw new ApiError(401, "refresh token is expired ")
     }
     const options = {
        httpOnly: true,
        secure:  true 
     }
     const {accessToken, newrefreshToken } = await generateAccessTokenRefreshToken(user._id)

     return  res.status(201)
     .cookie("accessToken", accessToken, options)
     .cookie("newRefreshToken", newrefreshToken, options)
     .json( new ApiResponse(201, { accessToken , refreshToken: newrefreshToken}, "access token refreshed "))

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token " )
        
    }
  })
  //Change password 
  const changePassword  = AsyncHandler(async(req, res)=>{
    const {oldPassword, newPassword} = req.body

    const user = await  User.findById(req.user?._id)

    const isPasswordCorrect = await  user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password ")
    }
    user.password = newPassword

    await user.save({validateBeforeSave: false})
    
    return res.status(201)
    .json(new ApiResponse(200, {}, "password changed successfully "))
  })

  const getCurrentUser  = AsyncHandler(async(req, res)=> {
    return res.status(201)
    .json(new ApiResponse(200, req.user, "Current user feteched successfully"))
  })

  const updateAccountDetails = AsyncHandler(async(req, res )=>{
    const {fullName , email } = req.body 

    if(!fullName || !email){
        throw new ApiError(401, " All feilds are required ")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set : {
            fullName,
            email: email
        },
       

    },{
        new: true
    }).select("-password")

    return  res.status(201)
    .json(new ApiResponse(200, user, "Account details uodated successfully "))
     
  })

  //Update avatar 

  const  updataAvatar =  AsyncHandler(async( req, res)=>{

    const avatarLocalPath   = req.files?.path
    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is missing ")
    }

     const avatar  = await  uploadOnCloudinary(avatarLocalPath)
     if(!avatar.url){
        throw new ApiError(400, " Error while uploading ")
     }

     const user  = await  User.findByIdAndUpdate(
        req.user?._id, {
            $set: {
                avatar : avatar.url
            }
        },
        {
            new: true 
        }
     ).select("-password")


    return res.status(201)
    .json(new ApiResponse(200, user , "Avatar  updated successfully "))

  })
//update coverimage 

const  updateCoverImage =  AsyncHandler(async( req, res)=>{

    const coverLocalPath   = req.files?.path
    if(!coverLocalPath){
        throw new ApiError(400 , "Avatar file is missing ")
    }

     const coverImage = await  uploadOnCloudinary(avatarLocalPath)
     if(!coverImage.url){
        throw new ApiError(400, " Error while uploading ")
     }

     const user  = await  User.findByIdAndUpdate(
        req.user?._id, {
            $set: {
                coverImage : coverImage.url
            }
        },
        {
            new: true 
        }
     ).select("-password")


    return res.status(201)
    .json(new ApiResponse(200, user , "CoverImage  updated successfully "))

  })
  //aggregation pipeline 
  
  const getUserChannelProfile = AsyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "Subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "Subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribedTo.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscriberCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ]);

    if (!channel.length) {
        throw new ApiError(404, "Channel does not exist");
    }

    return res.status(200)
        .json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
});

const getwatchHistory = AsyncHandler(async (req, res) => {
  
        const user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup: {
                    from: "Video",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "User",
                                localField: "owner",
                                foreignField: "_id",
                                as: "Owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            avatar: 1,
                                            username: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $unwind: "$Owner"
                        }
                    ]
                }
            },
            {
                $unwind: "$watchHistory"
            }
        ]);

        return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"));
    
});




export { registerUser, loginUser , logoutUser, refreshAccessToken, changePassword,  getCurrentUser, updateAccountDetails, updataAvatar, updateCoverImage, getUserChannelProfile,
    getwatchHistory
};
