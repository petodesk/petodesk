import { NextResponse } from "next/server"
import { Resend } from "resend"

 const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { email, companyName } = await req.json()

    const { error } = await resend.emails.send({
      from: "Petodesk <noreply@petodesk.com>",
      to: email,
      subject: "Account Suspension Notice",
      html: `
        <div style="font-family: Arial; line-height:1.6;">
          <h2>Account Suspended</h2>
          
          <p>Hello,</p>

          <p>Your company <strong>${companyName}</strong> has been temporarily suspended.</p>

          <p>
            This may be due to policy violations, billing issues, or unusual activity.
          </p>

          <p>
            Please contact our support team to resolve this issue:
          </p>

          <p>
            📧 <strong>support@petodesk.com</strong>
          </p>

          <p>
            We’re here to help you get back up and running as soon as possible.
          </p>

          <br/>

          <p>— Petodesk Team</p>
        </div>
      `,
    })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error("Email Sending Error:", err)

    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}