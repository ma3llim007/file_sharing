import express from "express";
import { login, logout, register } from "../../controllers/user.controller";
import { verifyAndAutoRefreshToken } from "../../middleware/verifyAndRefresh";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.post("/logout", verifyAndAutoRefreshToken, logout);
export default router;
