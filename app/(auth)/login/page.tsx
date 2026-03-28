'use client'
import PasswordInput from "@/app/components/PasswordInpup";
import { createClient } from "@/app/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { Loading } from "@/app/components/Loading";

export default function Home() {
    const router = useRouter()
    const supabase = createClient()

    const [showPassword, setShowPassword] = useState(false)

    const [checkingSession, setCheckingSession] = useState(true)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')

    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getSession()
                const user = data.session?.user
            if (!user) {
                setCheckingSession(false)
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', data.session?.user.id)
                .maybeSingle()

            if (!profile) {
                router.replace('/company')
            } else {
                router.replace('/dashboard')
            }

            setCheckingSession(false)
        }

        checkUser()
    }, [router])
const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  setLoading(false)

  if (error) {
    if (error.message.toLowerCase().includes('invalid login')) {
      toast.error('Invalid email or password')
    } else if (error.message.toLowerCase().includes('email not confirmed')) {
      toast.error('Please verify your email first')
    } else {
      toast.error(error.message)
    }
    return
  }

  const user = data.user

  // ✅ same redirect logic you already use
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    router.replace('/company')
  } else {
    router.replace('/dashboard')
  }
}

    const handleForgotPassword = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!email) {
            alert("Please enter your email address first.");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        setLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Password reset link sent! Check your email.");
        }
    };

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
    if (checkingSession) return <Loading />

    return (
        <div className="flex items-center justify-center bg-gray-60 p-4 h-screen ">
            <div className="w-full max-w-xl rounded-lg shadow-lg m-5 py-6 my-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to PetoDesk</h1>
                    <p className="text-gray-600">Log in or Create account to manage your business operations.</p>
                </div>

                {/* Login Form */}
                <div className="p-3 md:p-6">
                    <form onSubmit={handleSignIn} className="flex flex-col gap-3">
                        {/* Email */}
                        <div className="flex flex-col gap-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e: any) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full px-3 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your email"
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-3">
                            <div className=" mb-1">
                                <PasswordInput
                                    label="Password *"
                                    value={password}
                                    disabled={loading}
                                    show={showPassword}
                                    toggle={() => setShowPassword(!showPassword)}
                                    onChange={(e: any) => setPassword(e.target.value)}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm text-blue-600 hover:text-blue-900 text-left"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Continue Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-md btn-primary flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <ClipLoader
                                    color="white"
                                    size={20}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                />
                            ) : (
                                'Continue'
                            )}
                        </button>

                    </form>

                    {/* Sign up Link */}
                    <div className="text-center mt-6">
                        <p className="text-gray-600">
                            Don't have an account?{" "}
                            <Link href="/signup" className="text-blue-600 font-medium hover:text-blue-800">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-3 text-gray-500 text-sm">OR</span>
                        </div>
                    </div>

                    {/* Google */}
                    <button
                        type="button"
                        disabled={googleLoading || loading}
                        onClick={handleGoogleLogin}
                        className="w-full border py-3 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition cursor-pointer"
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            className="w-4 h-4"
                        />
                        Continue with Google
                    </button>

                    {/* Footer */}
                    <p className="text-center text-gray-500 text-sm mt-6">
                        Get started - it's free. No credit card needed.
                    </p>
                </div>
            </div>
        </div>
    );
}