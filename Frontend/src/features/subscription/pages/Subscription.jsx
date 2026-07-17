import React, { useEffect, useState } from "react"
import PlanCard from "../components/PlanCard"
import {
    getSubscriptionPlans,
    createOrder,
    verifyPayment,
    reportFailedPayment
} from "../services/subscription.api"

import UserNavbar from "../../auth/components/UserNavbar"
import "../style/subscription.scss"
import { useContext } from "react"
import { AuthContext } from "../../auth/auth.context"

const Subscription = () => {
    const { user, setUser } = useContext(AuthContext)
    const [plans, setPlans] = useState({})

    const fetchPlans = async () => {

        const data = await getSubscriptionPlans()

        if (data?.plans) {
            setPlans(data.plans)
        }

    }

    useEffect(() => {
        fetchPlans()
    }, [])

    const handleBuy = async (planKey) => {

        try {

            const data = await createOrder(planKey)

            const order = data.order

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,

                amount: order.amount,
                currency: order.currency,

                name: "InterviewForge",
                description: "Subscription Plan",

                order_id: order.id,

                handler: async function (response) {

                    const verifyData = {
                        ...response,
                        plan: planKey
                    }

                    const result = await verifyPayment(verifyData)

                    setUser({
                        ...user,
                        tokens: result.tokens,
                        subscriptionPlan: result.subscriptionPlan
                    })

                    alert("Payment successful! Tokens credited.")

                },

                modal: {

                    ondismiss: async function () {

                        await reportFailedPayment({
                            orderId: order.id,
                            status: "CANCELLED",
                            failureReason: "USER_DISMISSED_CHECKOUT"
                        })

                    }

                },

                theme: {
                    color: "#6366f1"
                }

            }

            const razorpay = new window.Razorpay(options)

            razorpay.on("payment.failed", async function (response) {

                await reportFailedPayment({

                    orderId: order.id,

                    status: "FAILED",

                    failureReason:
                        response.error?.description ||
                        "PAYMENT_FAILED"

                })

            })

            razorpay.open()

        } catch (error) {

            console.error(error)

            alert("Payment failed")

        }

    }

    return (

        <div className="subscription-page">

            <UserNavbar />

            <div className="subscription-container">

                <h1 className="subscription-title">
                    Upgrade Your Plan
                </h1>

                <p className="subscription-subtitle">
                    Purchase tokens to continue generating interview plans
                </p>

                <div className="plans-grid">

                    {Object.keys(plans).map((key) => (

                        <PlanCard
                            key={key}
                            planKey={key}
                            plan={plans[key]}
                            onBuy={handleBuy}
                        />

                    ))}

                </div>

            </div>

        </div>
    )
}

export default Subscription