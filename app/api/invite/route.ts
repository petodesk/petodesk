import { createInvite } from '@/app/actions/inviteEmployee'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, companyId } = await req.json()

    const result = await createInvite(email, companyId)

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}