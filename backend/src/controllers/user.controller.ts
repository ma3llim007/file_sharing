import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { cookie } from "../utils/cookieOptions";
import { ApiError, ApiResponse, asyncHandler } from "../utils/api";

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
        throw new ApiError(422, "All fields are required: First Name, Last Name, Email, and Password.");
    }
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User already exists, please login or use a different email.");
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

export default register;
