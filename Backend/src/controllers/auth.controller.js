const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

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

    res.cookie("token", token);

    return {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl,
        theme: user.theme,
        emailAlertsEnabled: user.emailAlertsEnabled,
        connectedProviders: user.connectedProviders
    };
}

/**
 * Find existing user by email or create a new one for OAuth logins.
 *
 * For social-auth users we generate a random password (they log in via the provider only).
 *
 * @param {{ email: string; usernameHint: string }} payload
 */
async function findOrCreateOAuthUser({ email, usernameHint }) {
    let user = await userModel.findOne({ email });

    if (user) {
        return user;
    }

    const baseUsername = usernameHint || email.split("@")[0];
    let username = baseUsername;
    let suffix = 1;

    // Ensure username is unique
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const exists = await userModel.findOne({ username });
        if (!exists) break;
        username = `${baseUsername}${suffix++}`;
    }

    const randomPassword = await bcrypt.hash(
        `oauth:${Date.now()}:${Math.random().toString(36).slice(2)}`,
        10
    );

    user = await userModel.create({
        username,
        email,
        password: randomPassword
    });

    return user;
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

    res.clearCookie("token");

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

/**
 * @route GET /api/auth/google
 * @description Start Google OAuth2 login by redirecting to Google consent screen.
 * @access Public
 */
async function googleOAuthRedirectController(_req, res) {
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: `${process.env.BACKEND_URL || "http://localhost:3000"}/api/auth/google/callback`,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent"
    });

    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

/**
 * @route GET /api/auth/google/callback
 * @description Handle Google OAuth2 callback, create/find user, set JWT cookie and redirect to frontend.
 * @access Public
 */
async function googleOAuthCallbackController(req, res) {
    const { code } = req.query;

    if (!code) {
        return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
    }

    try {
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: `${process.env.BACKEND_URL || "http://localhost:3000"}/api/auth/google/callback`,
                grant_type: "authorization_code"
            })
        });

        if (!tokenResponse.ok) {
            return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
        }

        const tokenJson = await tokenResponse.json();

        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${tokenJson.access_token}` }
        });

        if (!userInfoResponse.ok) {
            return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
        }

        const profile = await userInfoResponse.json();

        if (!profile.email) {
            return res.redirect(`${FRONTEND_URL}/login?error=google_no_email`);
        }

        let user = await findOrCreateOAuthUser({
            email: profile.email,
            usernameHint: profile.given_name || profile.name || profile.email.split("@")[0]
        });
        if (!user.connectedProviders.google) {
            user.connectedProviders.google = true;
            user = await user.save();
        }

        signAndAttachToken(res, user);

        return res.redirect(FRONTEND_URL);
    } catch (_err) {
        return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
    }
}

/**
 * @route GET /api/auth/github
 * @description Start GitHub OAuth2 login by redirecting to GitHub.
 * @access Public
 */
async function githubOAuthRedirectController(_req, res) {
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        scope: "read:user user:email"
        // We intentionally do NOT send redirect_uri here and instead rely on
        // the callback URL configured in the GitHub OAuth app to avoid
        // mismatch issues that can cause GitHub 404 pages.
    });

    res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}

/**
 * @route GET /api/auth/github/callback
 * @description Handle GitHub OAuth2 callback, create/find user, set JWT cookie and redirect to frontend.
 * @access Public
 */
async function githubOAuthCallbackController(req, res) {
    const { code } = req.query;

    if (!code) {
        return res.redirect(`${FRONTEND_URL}/login?error=github_auth_failed`);
    }

    try {
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            })
        });

        if (!tokenResponse.ok) {
            return res.redirect(`${FRONTEND_URL}/login?error=github_auth_failed`);
        }

        const tokenJson = await tokenResponse.json();

        const userInfoResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${tokenJson.access_token}`,
                "User-Agent": "interview-ai-app"
            }
        });

        if (!userInfoResponse.ok) {
            return res.redirect(`${FRONTEND_URL}/login?error=github_auth_failed`);
        }

        const profile = await userInfoResponse.json();

        // GitHub may not expose email on the main profile; fetch from /user/emails as a fallback.
        let email = profile.email;

        if (!email) {
            const emailsResponse = await fetch("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `Bearer ${tokenJson.access_token}`,
                    "User-Agent": "interview-ai-app",
                    Accept: "application/vnd.github+json"
                }
            });

            if (emailsResponse.ok) {
                const emails = await emailsResponse.json();
                const primary = emails.find((e) => e.primary && e.verified) ||
                    emails.find((e) => e.verified) ||
                    emails[0];

                email = primary?.email;
            }
        }

        if (!email) {
            return res.redirect(`${FRONTEND_URL}/login?error=github_no_email`);
        }

        let user = await findOrCreateOAuthUser({
            email,
            usernameHint: profile.login || email.split("@")[0]
        });
        if (!user.connectedProviders.github) {
            user.connectedProviders.github = true;
            user = await user.save();
        }

        signAndAttachToken(res, user);

        return res.redirect(FRONTEND_URL);
    } catch (_err) {
        return res.redirect(`${FRONTEND_URL}/login?error=github_auth_failed`);
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    googleOAuthRedirectController,
    googleOAuthCallbackController,
    githubOAuthRedirectController,
    githubOAuthCallbackController
};