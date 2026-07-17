import userModel from "../models/user.model.js";

/**
 * @name checkUserTokens
 * @description Validates that the authenticated user has sufficient tokens
 *              before allowing access to protected features.
 * @access Private
 */
async function checkUserTokens(req, res, next) {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.tokens <= 0) {
            return res.status(403).json({
                message: "NO_TOKENS"
            });
        }

        next();
    } catch (error) {
        console.error("Token middleware error:", error);
        return res.status(500).json({
            message: "Token validation failed"
        });
    }
}

export { checkUserTokens };