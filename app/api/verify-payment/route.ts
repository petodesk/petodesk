import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const transaction_id = body.transaction_id

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Verify payment with Flutterwave
        const res = await fetch(
            `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                },
            }
        )

        const data = await res.json()

        if (data.status !== 'success' || data.data.status !== 'successful') {
            return NextResponse.json({ error: 'Payment not successful' }, { status: 400 })
        }

        const payment = data.data

        // Prevent duplicate payment
        const { data: existing } = await supabase
            .from('payments')
            .select('id')
            .eq('reference', payment.tx_ref)
            .single()

        if (existing) return NextResponse.json({ success: true })

        // Insert into payments table
        await supabase.from('payments').insert({
            company_id: payment.meta.company_id,
            amount: payment.amount,
            currency: payment.currency,
            status: 'paid',
            payment_date: new Date(),
            reference: payment.tx_ref,
            verified: true,
        })

        // Activate subscription
        await supabase
            .from('subscriptions')
            .update({
                status: 'active',
                plan_id: payment.meta.plan_id,
                current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            })
            .eq('company_id', payment.meta.company_id)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Payment verification error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}