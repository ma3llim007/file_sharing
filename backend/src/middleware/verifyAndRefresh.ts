import { NextFunction, Request, Response } from "express";
import Jwt from "jsonwebtoken";
import { ApiError } from "../utils/api";
import { generateAccessAndRefreshTokens, isTokenExpired } from "../utils/Token";
import { httpOnly } from "../utils/cookieOptions";
import { IUser, User } from "../models/user.model";

interface JwtPayloadWithId extends Jwt.JwtPayload {
    _id: string;
}

// Extend Request to include user
declare module "express-serve-static-core" {
    interface Request {
        user?: IUser | null;
    }
}

export const verifyAndAutoRefreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let accessToken = req.cookies?.accessToken;
        const refreshToken = req.cookies?.refreshToken;
        
        // If access token exists and is not expired, use it
        if (!accessToken || isTokenExpired(accessToken)) {
            // Access token missing or expired, try refresh token
            if (!refreshToken) {
                res.status(401).json(new ApiError(401, "Refresh Token Missing. Please Log In Again."));
                return;
            }

            // Decode refresh token
            const decodedRefreshToken = Jwt.decode(refreshToken) as JwtPayloadWithId | null;

            if (!decodedRefreshToken?._id) {
                res.status(401).json(new ApiError(401, "Invalid Refresh Token"));
                return;
            }

            // Generate new tokens
            const tokens = await generateAccessAndRefreshTokens(decodedRefreshToken._id);

            // Set new tokens as cookies
            res.cookie("accessToken", tokens.accessToken, httpOnly);
            res.cookie("refreshToken", tokens.refreshToken, httpOnly);

            accessToken = tokens.accessToken;
        }

        // Verify and decode access token
        const decodedAccessToken = Jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET || "") as JwtPayloadWithId;
        if (!decodedAccessToken?._id) {
            res.status(401).json(new ApiError(401, "Invalid Access Token: Token Decoding Failed"));
            return;
        }

        // Find User By Id
        const user = await User.findById(decodedAccessToken._id);
        if (!user) {
            res.status(401).json(new ApiError(401, "User Not Found"));
            return;
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error: any) {
        const errorMessage = error.name === "TokenExpiredError" ? "Access Token Expired" : error?.message || "Invalid Access Token";
        res.status(401).json(new ApiError(401, errorMessage));
        return;
    }
};
