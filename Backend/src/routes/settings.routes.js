import { Router } from "express";

import { authUser } from "../middlewares/auth.middleware.js";

import {
    getSettingsController,
    updateAccountSettingsController,
    updateAppearanceSettingsController,
    updateNotificationSettingsController,
    getActiveSessionsController,
    deleteAccountController,
    uploadProfilePictureController
} from "../controllers/settings.controller.js";

import upload from "../middlewares/upload.middleware.js";


const settingsRouter = Router();

/**
 * @route GET /api/settings
 * @description Get current user's settings and profile information.
 * @access Private
 */
settingsRouter.get("/", authUser, getSettingsController);

/**
 * @route PATCH /api/settings/account
 * @description Update account information (name, email, profile picture).
 * @access Private
 */
settingsRouter.patch(
    "/account",
    authUser,
    updateAccountSettingsController
);

/**
 * @route PATCH /api/settings/appearance
 * @description Update appearance settings (theme).
 * @access Private
 */
settingsRouter.patch(
    "/appearance",
    authUser,
    updateAppearanceSettingsController
);

/**
 * @route PATCH /api/settings/notifications
 * @description Update notification preferences.
 * @access Private
 */
settingsRouter.patch(
    "/notifications",
    authUser,
    updateNotificationSettingsController
);

/**
 * @route GET /api/settings/sessions
 * @description Get a list of active sessions for the user.
 * @access Private
 */
settingsRouter.get(
    "/sessions",
    authUser,
    getActiveSessionsController
);

/**
 * @route DELETE /api/settings/account
 * @description Permanently delete the current user's account and related data.
 * @access Private
 */
settingsRouter.delete(
    "/account",
    authUser,
    deleteAccountController
);

settingsRouter.post(
    "/upload-avatar",
    authUser,
    upload.single("avatar"),
    uploadProfilePictureController
);

export default settingsRouter;