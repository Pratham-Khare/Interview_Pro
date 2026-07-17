import PLANS from "../config/plans.js";
import { creditTokensToUser } from "../services/subscription.service.js";
import userModel from "../models/user.model.js";
import razorpay from "../utils/razorpay.js";
import crypto from "crypto";
import paymentModel from "../models/payment.model.js";

/**
 * @name getPlansController
 * @description Returns all available subscription plans.
 * @access Public
 */
async function getPlansController(req, res) {

    res.status(200).json({
        plans: PLANS
    })

}

/**
 * @name getUserTokensController
 * @description Returns the authenticated user's available tokens and active subscription plan.
 * @access Private
 */
async function getUserTokensController(req, res) {

    const user = await userModel.findById(req.user.id).select("tokens subscriptionPlan")

    res.status(200).json({
        tokens: user.tokens,
        subscriptionPlan: user.subscriptionPlan
    })

}

/* TEMP purchase endpoint (before Razorpay integration) */
async function purchasePlanController(req, res) {

    try {

        const { plan } = req.body

        const result = await creditTokensToUser(req.user.id, plan)

        res.status(200).json({
            message: "Tokens credited successfully",
            tokens: result.tokens,
            subscriptionPlan: result.plan
        })

    } catch (error) {

        res.status(400).json({
            message: error.message
        })

    }

}

/**
 * @name createOrderController
 * @description Creates a Razorpay order and stores the initial payment record.
 * @access Private
 */
async function createOrderController(req, res) {

    try {

        const { plan } = req.body

        const selectedPlan = PLANS[plan]

        if (!selectedPlan) {
            return res.status(400).json({
                message: "Invalid plan selected"
            })
        }

        const options = {
            amount: selectedPlan.price * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        }

        const order = await razorpay.orders.create(options)

        await paymentModel.create({
            user: req.user.id,
            plan,
            amount: selectedPlan.price,
            orderId: order.id,
            status: "PENDING"
        })

        res.status(200).json({
            order,
            plan
        })

    } catch (error) {

        console.error(error)

        res.status(500).json({
            message: "Failed to create order"
        })

    }

}


/**
 * @name verifyPaymentController
 * @description Verifies the Razorpay payment signature, updates the payment status,
 *              and credits subscription tokens after successful verification.
 * @access Private
 */
async function verifyPaymentController(req, res) {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            plan
        } = req.body

        const payment = await paymentModel.findOne({
            orderId: razorpay_order_id
        })

        if (!payment) {

            return res.status(404).json({
                message: "Payment record not found"
            })

        }

        if (payment.status === "SUCCESS") {

            return res.status(200).json({
    message: "Payment already processed",
    tokens: req.user.tokens
})

        }

        const body = razorpay_order_id + "|" + razorpay_payment_id

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex")

        if (expectedSignature !== razorpay_signature) {

            payment.status = "FAILED"
            payment.failureReason = "SIGNATURE_VERIFICATION_FAILED"

            await payment.save()

            return res.status(400).json({
                message: "Payment verification failed"
            })

        }

        payment.paymentId = razorpay_payment_id
        payment.signature = razorpay_signature
        payment.status = "SUCCESS"

        await payment.save()

        if (!payment.isTokensCredited) {

            const result = await creditTokensToUser(
                req.user.id,
                plan
            )

            payment.isTokensCredited = true

            await payment.save()

            return res.status(200).json({
                message: "Payment successful",
                tokens: result.tokens,
                subscriptionPlan: result.plan
            })

        }

        res.status(200).json({
            message: "Payment already processed"
        })

    } catch (error) {

        console.error(error)

        res.status(500).json({
            message: "Payment verification failed"
        })

    }

}


/**
 * @name paymentFailedController
 * @description Updates the payment record when a payment fails or is cancelled.
 * @access Private
 */
async function paymentFailedController(req, res) {

    try {

        const {
            orderId,
            status,
            failureReason
        } = req.body

        const payment = await paymentModel.findOne({
            orderId
        })

        if (!payment) {

            return res.status(404).json({
                message: "Payment record not found"
            })

        }

        if (payment.status === "SUCCESS") {

            return res.status(200).json({
                message: "Payment already completed"
            })

        }

        payment.status = status
        payment.failureReason = failureReason

        await payment.save()

        res.status(200).json({
            message: "Payment status updated"
        })

    } catch (error) {

        console.error(error)

        res.status(500).json({
            message: "Failed to update payment status"
        })

    }

}

export {
    getPlansController,
    purchasePlanController,
    getUserTokensController,
    createOrderController,
    verifyPaymentController,
    paymentFailedController
};