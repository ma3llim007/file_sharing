import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { ApiError, ApiResponse, asyncHandler } from "../utils/api";
import { generateAccessAndRefreshTokens } from "../utils/Token";
import { httpOnly } from "../utils/cookieOptions";

// Register Controller
interface RegisterRequestBody {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
const register = asyncHandler(async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
    const { firstName, lastName, email, password } = req?.body;
    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password?.trim()) {
        return res.status(422).json(new ApiError(422, "All fields are required: First Name, Last Name, Email, and Password."));
    }
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json(new ApiError(409, "User already exists, please login or use a different email."));
    }

    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
    });

    // Remove sensitive info before sending response
    const userObj = user.toObject() as any;
    delete userObj.password;
    delete userObj.refreshToken;
    return res.status(201).json(new ApiResponse(201, userObj, "User registered successfully. Please Login"));
});

// Login Controller
interface LoginRequestBody {
    email: string;
    password: string;
}
const login = asyncHandler(async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
        return res.status(422).json(new ApiError(422, "Email and Password are required"));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json(new ApiError(404, "No account found with this email."));
    }

    // Validate password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        return res.status(401).json(new ApiError(401, "Invalid credentials. Please check your password and try again."));
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Convert user document to object and remove sensitive fields
    const loggedInUser = user.toObject() as any;
    delete loggedInUser.password;
    delete loggedInUser.refreshToken;

    return res.status(200).cookie("accessToken", accessToken, httpOnly).cookie("refreshToken", refreshToken, httpOnly).json(new ApiResponse(200, loggedInUser, "User Login Successfully"));
});

// Logout Controller
const logout = asyncHandler(async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
    console.log(req.user);

    // if (!req.user || !req.user._id) {
    //     return res.status(400).json({ success: false, message: "User not authenticated" });
    // }
    return res.status(200).clearCookie("accessToken", httpOnly).clearCookie("refreshToken", httpOnly).json(new ApiResponse(200, {}, "User logged out successfully"));
});
export { register, login, logout };
