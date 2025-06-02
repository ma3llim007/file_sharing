import { CookieOptions } from "express";

export const httpOnly: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
};
