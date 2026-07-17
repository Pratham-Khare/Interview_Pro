import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import tokenBlacklistModel from "../models/blacklist.model.js";

/**
 * Issue a signed JWT and set it as an HTTP cookie, then return the public user payload.
 *
 * @param {import("express").Response} res
 * @param {{ _id: string; username: string; email: string }} user
 * @returns {{ id: string; username: string; email: string }}
 */
function signAndAttachToken(res, user) {
    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
        process.env.NODE_ENV === "production"
            ? "none"
            : "lax",
    maxAge: 24 * 60 * 60 * 1000
});
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl,
        theme: user.theme,
        emailAlertsEnabled: user.emailAlertsEnabled,
    };
}


/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        });
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username }, { email }]
    });

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists with this email address or username"
        });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hash
    });

    const publicUser = signAndAttachToken(res, user);

    res.status(201).json({
        message: "User registered successfully",
        user: publicUser
    });
}

/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Please provide both email and password"
        });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }

    const publicUser = signAndAttachToken(res, user);

    res.status(200).json({
        message: "User loggedIn successfully.",
        user: publicUser
    });
}

/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token;

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
        process.env.NODE_ENV === "production"
            ? "none"
            : "lax"
});
    res.status(200).json({
        message: "User logged out successfully"
    });
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id);

    const publicUser = signAndAttachToken({ cookie: () => {} }, user);

    res.status(200).json({
        message: "User details fetched successfully",
        user: publicUser
    });
}

export {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}