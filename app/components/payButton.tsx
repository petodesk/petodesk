'use client'

import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3'

export default function PayButton({ user, plan }: { user: any, plan: any }) {

    const config = {
        public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY!,
        tx_ref: Date.now().toString(),
        amount: plan.price,
        currency: "USD",
        payment_options: "card, mobilemoney, banktransfer",
        customer: {
            email: user.email,
            name: user.full_name,
        },
        customizations: {
            title: "Petodesk Subscription",
            description: `Payment for ${plan.name}`,
        },
    }

    const handleFlutterPayment = useFlutterwave(config)

    return (
        <button
            onClick={() => {
                handleFlutterPayment({
                    callback: (response) => {
                        console.log(response)

                        // send to backend for verification
                        fetch('/api/verify-payment', {
                            method: 'POST',
                            body: JSON.stringify(response),
                        })

                        closePaymentModal()
                    },
                    onClose: () => {},
                })
            }}
            className="btn-primary"
        >
            Pay ${plan.price}
        </button>
    )
}