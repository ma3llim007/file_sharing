import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log(`🛠️  MONGODB Connected! DB HOST: ${connectionInstance.connection.host} DB NAME: ${connectionInstance.connection.db?.databaseName ?? "unknown"}}`);
    } catch (error: any) {
        console.error("💀  MONGODB CONNECTION ERROR ", error.message);
        process.exit(1);
    }
};

export default connectDB;
