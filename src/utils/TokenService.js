import jwt from "jsonwebtoken";
import crypto from "crypto";
import RefreshTokenModel from "../models/RefreshToken.js";

export const generateAccessToken = (user) => {
    return jwt.sign(
        { 
            id: user._id, 
            role: user.role ,
            email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m"}
    );
};

export const generateRefreshToken = async (user, ipAddress) => {
    const token = crypto.randomBytes(40).toString("hex");
    const expires = new Date(Date.now() + 7*24*60*60*1000); 

    const refreshToken = new RefreshTokenModel({
        user: user._id,
        token: token,
        expiresAt: expires,
        revokedByIp : ipAddress
    });

    await refreshToken.save();
    return token;
}