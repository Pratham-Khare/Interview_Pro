import jwt from "jsonwebtoken";
import tokenBlacklistModel from "../models/blacklist.model.js";

/**
 * @name authUser
 * @description Authenticates the current user by validating the JWT stored in cookies
 *              and blocks requests using blacklisted tokens.
 * @access Private
 */
async function authUser(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Token not provided."
        });
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token
    });

    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "token is invalid"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid token."
        });
    }
}

export { authUser };