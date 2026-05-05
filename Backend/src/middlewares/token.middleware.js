const userModel = require("../models/user.model");

async function checkUserTokens(req, res, next) {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Block request if tokens are exhausted[cite: 6, 7]
        if (user.tokens <= 0) {
            return res.status(403).json({
                message: "NO_TOKENS" // Critical string for Frontend Hook
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

module.exports = { checkUserTokens };