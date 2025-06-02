import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { config } from "../config/config";

// Define the interface for a User document
export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;

    // Methos
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const userScheme = new Schema<IUser>(
    {
        firstName: { type: String, required: [true, "First Name Is Required"], trim: true },
        lastName: { type: String, required: [true, "Last Name Is Required"], trim: true },
        email: { type: String, unique: true, required: [true, "Email Is Required"], lowercase: true, trim: true },
        password: { type: String },
        refreshToken: { type: String },
    },
    { timestamps: true }
);

// Pre-save middleware to hash password
userScheme.pre<HydratedDocument<IUser>>("save", async function (next: Function) {
    if (!this.isModified("password")) return next();

    try {
        this.password = await bcrypt.hash(this.password, 10);
    } catch (error: any) {
        next(error);
    }
});

// Instance method: check if password is correct
userScheme.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

// Instance method: generate access token
userScheme.methods.generateAccessToken = function (): string {
    const payload = {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: `${this.firstName} ${this.lastName}`,
    };

    const secret: Secret = config.ACCESS_TOKEN_SECRET;
    const expiresIn = config.ACCESS_TOKEN_EXPIRY as `${number}${"s" | "m" | "h" | "d"}`;
    return jwt.sign(payload, secret, { expiresIn });
};

// Instance Methos: generate Refresh token
userScheme.methods.generateRefreshToken = function (): string {
    const secret: Secret = config.REFRESH_TOKEN_SECRET;
    const expiresIn = config.REFRESH_TOKEN_EXPIRY as `${number}${"s" | "m" | "h" | "d"}`;

    return jwt.sign({ _id: this._id }, secret, { expiresIn });
};

export const User: Model<IUser> = mongoose.model<IUser>("User", userScheme);
