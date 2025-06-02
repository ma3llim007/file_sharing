import mongoose, { Model, Schema } from "mongoose";

// Define the interface for a folder document
export interface IFolder extends Document {
    folderName: string;
    createdAt: Date;
    updatedAt: Date;
}

const folderScheme = new Schema<IFolder>({ folderName: { type: String, unique: true, required: [true, "Folder Name Is Required"], lowercase: true, trim: true } }, { timestamps: true });

export const Folder: Model<IFolder> = mongoose.model<IFolder>("Folder", folderScheme);
