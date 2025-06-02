import dotenv from "dotenv";
dotenv.config();

// Helper to throw error if env var is missing
const getEnvVar = (key: string, required = true): string => {
    const value = process.env[key];
    if (!value && required) {
        throw new Error(`❌ Missing required environment variable: ${key}`);
    }
    return value!;
};

export const config = {
    // MongoDB
    MONGODB_URI: getEnvVar("MONGODB_URI"),
    DB_NAME: getEnvVar("DB_NAME"),

    // JWT
    ACCESS_TOKEN_SECRET: getEnvVar("ACCESS_TOKEN_SECRET"),
    ACCESS_TOKEN_EXPIRY: getEnvVar("ACCESS_TOKEN_EXPIRY"),
    REFRESH_TOKEN_SECRET: getEnvVar("REFRESH_TOKEN_SECRET"),
    REFRESH_TOKEN_EXPIRY: getEnvVar("REFRESH_TOKEN_EXPIRY"),

    // Server
    PORT: getEnvVar("PORT", false) || "5000",
};
