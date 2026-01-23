'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/client'

export default function VerifyEmailContent() {
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    setEmail(searchParams.get('email'))
  }, [searchParams])

  useEffect(() => {
    if (otp.length === 6 && email) {
      handleVerify()
    }
  }, [otp, email])

  const handleVerify = async () => {
    if (!email || otp.length !== 6) return

    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    })
    setLoading(false)

    if (error) {
      alert(error.message)
    } else {
      router.push('/company')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Verify your email
        </h1>

        <p className="text-gray-500 text-center mt-3 mb-8">
          Enter the 6-digit code sent to <br />
          <strong>{email ?? 'your email'}</strong>
        </p>

        <div
          className="flex justify-between gap-3 mb-8 cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {[...Array(6)].map((_, i) => {
            const isActive = i === otp.length
            return (
              <div
                key={i}
                className={`h-14 w-full rounded-md border-2 flex items-center justify-center text-2xl font-bold relative
                  ${isActive ? 'border-blue-600' : 'border-gray-300'}`}
              >
                {otp[i] ?? ''}
                {isActive && !loading && (
                  <span className="absolute w-[2px] h-7 bg-blue-600 animate-pulse" />
                )}
              </div>
            )
          })}
        </div>

        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          autoFocus
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
          }
          onPaste={(e) => {
            const pasted = e.clipboardData
              .getData('text')
              .replace(/\D/g, '')
              .slice(0, 6)
            setOtp(pasted)
          }}
          className="absolute opacity-0 pointer-events-none"
        />

        <button
          disabled={loading}
          onClick={handleVerify}
          className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl text-lg
                     hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? 'Verifying…' : 'Verify email'}
        </button>
      </div>
    </div>
  )
}