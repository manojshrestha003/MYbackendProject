//auth middleware 
import { ApiError } from '../utils/ApiError';
import { AsyncHandler } from '../utils/AsyncHandler';
import jwt from 'jsonwebtoken';
import { User } from '../models/Users.model';


export const verifyJWT = AsyncHandler(async (req, res, next) => {
    try {
        // Extract token from cookies or authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token provided");
        }

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Fetch the user based on the token
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Unauthorized request: Invalid token");
        }

        // Attach the user to the request object
        req.user = user;
        next();
        
    } catch (error) {
        // Pass error to the next middleware (error handler)
        next(new ApiError(401, error.message || "Invalid access token"));
    }
});
