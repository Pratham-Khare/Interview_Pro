import userModel from "../models/user.model.js";
import interviewReportModel from "../models/interviewReport.model.js";
import tokenBlacklistModel from "../models/blacklist.model.js";


/**
 * @route GET /api/settings
 * @description Get current user's settings and profile information.
 * @access Private
 */
async function getSettingsController(req, res) {
    const user = await userModel.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
        message: "Settings fetched successfully",
        settings: {
            name: user.username,
            email: user.email,
            profilePictureUrl: user.profilePictureUrl || "",
            theme: user.theme || "dark",
            emailAlertsEnabled: user.emailAlertsEnabled,
        }
    });
}

/**
 * @route PATCH /api/settings/account
 * @description Update account information (name, email, profile picture).
 * @access Private
 */
async function updateAccountSettingsController(req, res) {
    const { name, email, profilePictureUrl } = req.body;

    if (!name && !email && typeof profilePictureUrl === "undefined") {
        return res.status(400).json({
            message: "No changes provided."
        });
    }

    const user = await userModel.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    if (email && email !== user.email) {
        const existingEmail = await userModel.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                message: "Another account already exists with this email address."
            });
        }
    }

    if (name) {
        user.username = name;
    }
    if (email) {
        user.email = email;
    }
    if (typeof profilePictureUrl !== "undefined") {
        user.profilePictureUrl = profilePictureUrl || "";
    }

    await user.save();

    res.status(200).json({
        message: "Account settings updated successfully."
    });
}

/**
 * @route PATCH /api/settings/appearance
 * @description Update appearance settings (theme).
 * @access Private
 */
async function updateAppearanceSettingsController(req, res) {
    const { theme } = req.body;

    if (!["dark", "light"].includes(theme)) {
        return res.status(400).json({
            message: "Theme must be either 'dark' or 'light'."
        });
    }

    const user = await userModel.findByIdAndUpdate(
        req.user.id,
        { theme },
        { new: true }
    );

    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
        message: "Appearance settings updated successfully."
    });
}

/**
 * @route PATCH /api/settings/notifications
 * @description Update notification preferences.
 * @access Private
 */
async function updateNotificationSettingsController(req, res) {
    const { emailAlertsEnabled } = req.body;

    if (typeof emailAlertsEnabled !== "boolean") {
        return res.status(400).json({
            message: "emailAlertsEnabled must be a boolean."
        });
    }

    const user = await userModel.findByIdAndUpdate(
        req.user.id,
        { emailAlertsEnabled },
        { new: true }
    );

    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
        message: "Notification settings updated successfully."
    });
}

/**
 * @route GET /api/settings/sessions
 * @description Get a list of active sessions for the user.
 *              For simplicity we return the current session and the count of revoked tokens.
 * @access Private
 */
async function getActiveSessionsController(req, res) {
    const revokedCount = await tokenBlacklistModel.countDocuments({ });

    res.status(200).json({
        message: "Sessions fetched successfully",
        sessions: [
            {
                id: "current",
                device: req.headers["user-agent"] || "Current device",
                ip: req.ip || "unknown",
                current: true
            }
        ],
        revokedTokens: revokedCount
    });
}

/**
 * @route DELETE /api/settings/account
 * @description Permanently delete the current user's account and related interview reports.
 * @access Private
 */
async function deleteAccountController(req, res) {
    const userId = req.user.id;

    await interviewReportModel.deleteMany({ user: userId });
    await userModel.deleteOne({ _id: userId });

res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
        process.env.NODE_ENV === "production"
            ? "none"
            : "lax"
});
    res.status(200).json({
        message: "Account and all related data deleted successfully."
    });
}

async function uploadProfilePictureController(req, res) {
    try {
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        user.profilePictureUrl = req.file.path;

        await user.save();

        res.status(200).json({
            message: "Profile picture uploaded successfully.",
            profilePictureUrl: user.profilePictureUrl
        });

    } catch (error) {
        res.status(500).json({ message: "Upload failed." });
    }
}



export {
    getSettingsController,
    updateAccountSettingsController,
    updateAppearanceSettingsController,
    updateNotificationSettingsController,
    getActiveSessionsController,
    deleteAccountController,
    uploadProfilePictureController
};

