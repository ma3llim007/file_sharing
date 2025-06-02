import express from "express";
import userAuthRoutes from "./routes/users/auth.routes";

const app = express();

// Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Routes
app.use("/api/v1/user/auth", userAuthRoutes);
export default app;
