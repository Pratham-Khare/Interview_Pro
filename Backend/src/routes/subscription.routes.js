import express from "express";

import { authUser } from "../middlewares/auth.middleware.js";

import {
    getPlansController,
    purchasePlanController,
    getUserTokensController,
    createOrderController,
    verifyPaymentController,
    paymentFailedController
} from "../controllers/subscription.controller.js";

const router = express.Router();


/**
 * @route GET /api/subscription/plans
 * @description Returns all available subscription plans.
 * @access Public
 */
router.get("/plans", getPlansController);


/**
 * @route GET /api/subscription/tokens
 * @description Returns the authenticated user's available tokens and subscription plan.
 * @access Private
 */
router.get(
    "/tokens",
    authUser,
    getUserTokensController
);


/**
 * @route POST /api/subscription/purchase
 * @description Temporarily credits tokens to the authenticated user without payment.
 * @access Private
 */
router.post(
    "/purchase",
    authUser,
    purchasePlanController
);


/**
 * @route POST /api/subscription/create-order
 * @description Creates a Razorpay order for the selected subscription plan.
 * @access Private
 */
router.post(
    "/create-order",
    authUser,
    createOrderController
);


/**
 * @route POST /api/subscription/verify-payment
 * @description Verifies the Razorpay payment and credits subscription tokens.
 * @access Private
 */
router.post(
    "/verify-payment",
    authUser,
    verifyPaymentController
);

/**
 * @route POST /api/subscription/payment-failed
 * @description Updates the payment record when a payment fails or is cancelled.
 * @access Private
 */
router.post(
    "/payment-failed",
    authUser,
    paymentFailedController
)

export default router;