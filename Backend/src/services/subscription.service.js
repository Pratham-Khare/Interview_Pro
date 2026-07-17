import userModel from "../models/user.model.js";
import PLANS from "../config/plans.js";

async function creditTokensToUser(userId, planName) {
    const plan = PLANS[planName];

    if (!plan) {
        throw new Error("Invalid subscription plan");
    }

    const user = await userModel.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    user.tokens += plan.tokens;
    user.subscriptionPlan = planName;

    await user.save();

    return {
        tokens: user.tokens,
        plan: user.subscriptionPlan
    };
}

// export async function reportFailedPayment(data) {

//     try {

//         const response = await api.post(
//             "/api/subscription/payment-failed",
//             data
//         )

//         return response.data

//     } catch (error) {

//         console.error("Failed to update payment status", error)

//     }

// }

export { creditTokensToUser };