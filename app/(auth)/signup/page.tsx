'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PasswordInput from '@/app/components/PasswordInpup'
import { createClient } from '@/app/utils/supabase/client'
import { ClipLoader } from 'react-spinners'
import { toast } from "react-toastify";


export default function Signup() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const[googleLoading, setGoogleLoading] = useState(false)

  // 1. Password Strength Logic
  const getStrength = (pass: string) => {
    if (pass.length === 0) return { label: '', color: 'bg-gray-200', width: '0%' }
    if (pass.length < 6) return { label: 'Weak', color: 'bg-red-500', width: '33%' }
    if (pass.length < 10) return { label: 'Good', color: 'bg-yellow-500', width: '66%' }
    return { label: 'Strong', color: 'bg-green-500', width: '100%' }
  }
  const strength = getStrength(password)


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match!')
      return
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }

    setPasswordError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    /* ---------------- EMAIL ALREADY EXISTS ---------------- */
    if (!error && data.user && data.user.identities?.length === 0) {
      toast.error('An account with this email already exists. Please sign in.')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      return
    }


    if (error) {
      toast.error(error.message)
      return
    }

    /* ---------------- SUCCESS ---------------- */
    router.push(`/verify?email=${encodeURIComponent(email)}`)
  }
    const handleGoogleLogin = async () => {
        setGoogleLoading(true)
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  setGoogleLoading(false)
  if (error) toast.error(error.message)
}

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 font-poppins">
      <div className="w-full max-w-2xl bg-white p-8 py-12 rounded-xl shadow-sm my-10">
        <div className="text-right text-sm mb-6">
          <span className="text-gray-600">Have a PetoDesk? </span>
          <Link href="/login" className="text-blue-600 font-medium hover:underline">SIGN IN</Link>
        </div>
        <div className='flex flex-col gap-2 pb-4'>
          <h1 className="text-xl md:text-2xl font-semibold mb-2 text-center">
            Create Your Account
          </h1>
          <p className='text-sm text-center'>Sign up with your email to get started. We’ll verify your email for security</p>

        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          {/* <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='flex flex-col gap-3'>
              <label className="text-md">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-500 rounded-md"

                placeholder="Enter your email"
              />
            </div>
            <div>
              <PasswordInput
                label="Password *"
                value={password}
                disabled={loading}
                show={showPassword}
                toggle={() => setShowPassword(!showPassword)}
                onChange={(e: any) => setPassword(e.target.value)}
              />
            </div>

            <div>

              <PasswordInput
                label="Confirm Password"
                value={confirmPassword}
                disabled={loading}
                show={showPassword}
                toggle={() => setShowPassword(!showPassword)}
                onChange={(e: any) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="mt-2 w-[50%] flex flex-col gap-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 italic">Security Level: {strength.label}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: strength.width }}
                ></div>
              </div>
              {passwordError && (
                <p className="text-red-500 text-md">{passwordError}</p>
              )}
            </div>

          </div>

          <div className="flex items-start gap-2 text-sm text-gray-600">
            <input disabled={loading} type="checkbox" className="mt-1 cursor-pointer" />
            <p>
              I agree to the{' '}
              <span className="text-blue-600 cursor-pointer">Terms of Service</span>{' '}
              and{' '}
              <span className="text-blue-600 cursor-pointer">Privacy Policy</span>.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:bg-blue-300 cursor-pointer flex items-center justify-center gap-2 font-medium"
          >
            {loading ?
              <div className="flex items-center justify-center gap-2">
                <ClipLoader size={20} color="#ffffff" />
                <span>Creating Account...</span>
              </div> : 'Create Account'}
          </button> */}


          {/* Divider */}
          {/* <div className="flex items-center gap-4 my-4">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-400">or sign in using</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div> */}

          {/* Google */}
          <button
            disabled={googleLoading||loading}
            type="button" 
            onClick={handleGoogleLogin}
            className="w-full border py-3 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition cursor-pointer"
          >
            {googleLoading ? <ClipLoader size={20} color="#000" /> : (
              <>
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-4 h-4"
                />
                Continue with Google
              </>
            )}
          </button>

        </form>

      </div>
    </section>
  )
}




