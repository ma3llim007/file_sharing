import { HydratedDocument } from "mongoose";
import { IUser, User } from "../models/user.model";
import { ApiError } from "./api";
import jwt, { JwtPayload } from "jsonwebtoken";

interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export const generateAccessAndRefreshTokens = async (userId: Object): Promise<TokenPair> => {
    try {
        const user: HydratedDocument<IUser> | null = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwt.decode(token) as JwtPayload | null;

        if (!decoded || !decoded.exp) {
            // If token is invalid or doesn't have exp, consider expired
            return true;
        }
        const now = Date.now() / 1000;
        return decoded.exp < now;
    } catch (error) {
        return true;
    }
};
