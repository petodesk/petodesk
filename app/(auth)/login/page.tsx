'use client'
import PasswordInput from "@/app/components/PasswordInpup";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
    const [showPassword, setShowPassword] = useState(false)
    return (
        <div className="flex items-center justify-center bg-gray-60 p-4 ">
            <div className="w-full max-w-xl rounded-lg shadow-lg m-5 py-6 my-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to PetoDesk</h1>
                    <p className="text-gray-600">Log in to manage your business operations.</p>
                </div>

                {/* Login Form */}
                <div className="p-3 md:p-6">
                    <form className="flex flex-col gap-3">
                        {/* Email */}
                        <div className="flex flex-col gap-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full px-3 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your email"
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-3">
                            <div className=" mb-1">
                                <PasswordInput
                                    label="Password *"

                                    show={showPassword}
                                    toggle={() => setShowPassword(!showPassword)}
                                />

                            </div>
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                                Forgot password?
                            </a>
                        </div>

                        {/* Continue Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-md btn-primary"
                        >
                            Continue
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
                        className="w-full border py-3 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition  cursor-pointer"
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