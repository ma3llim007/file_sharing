import dotenv from "dotenv";
import connectDB from "./config/db";
import app from "./app";

dotenv.config();

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`⚙️  Server is Running at PORT : ${process.env.PORT}`);
        });
    })
    .catch((error: any) => {
        console.error("💀 MONGODB CONNECTION FAILED !!! ", error.message);
    });
