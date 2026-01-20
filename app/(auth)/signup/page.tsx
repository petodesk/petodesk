'use client'
import Link from 'next/link'
import { useState } from 'react'
import CustomPhoneInput from '@/app/components/PhoneInput'
import PasswordInput from '@/app/components/PasswordInpup'
import FeatureDropdown from '@/app/components/FeatureDropdown'
import IndustryDropdown from '@/app/components/IndustryDropdown'
import { log } from 'console'

export default function Signup() {
    const [showPassword, setShowPassword] = useState(false)
    const [phone, setPhone] = useState('')
    const [feature, setFeature] = useState<string | null>(null)
    const [industry, setIndustry] = useState<string | null>(null)


    console.log(feature, industry, phone)
    return (
        <section className="min-h-screen bg-gray-50 flex items-center justify-center px-4 font-poppins">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm  px-10 py-6 my-10">

                {/* Top right */}
                <div className="text-right text-sm mb-6">
                    <span className="text-gray-500">Have a PetoDesk? </span>
                    <Link href="/login" className="text-blue-600 font-medium hover:underline">
                        SIGN IN
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Create your business account
                    </h1>
                    <p className="text-md text-gray-500 mt-1">
                        You’ll start on the Free Plan. Upgrade anytime to unlock more features.
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-8 w-full flex-1">
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>

                        <div className='flex flex-col gap-2'>
                            <label className='text-md ' htmlFor="name"> Full Name *</label>
                            <input className='p-2 rounded-lg border border-gray-500' type="text" />

                        </div>
                        <div className='flex flex-col gap-2'>
                            <label className='text-md ' htmlFor="company"> Company Name *</label>
                            <input className='p-2 rounded-lg border border-gray-500 w-full' type="text" />

                        </div>
                    </div>

                    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10">

                        {/* Features */}
                        <div className="flex flex-col gap-2">
                            <label className="text-md">
                                Choose Your Features *
                            </label>
                            <FeatureDropdown
                                value={feature}
                                onChange={setFeature}
                            />
                        </div>

                        {/* Industry */}
                        <div className="flex flex-col gap-2">
                            <label className="text-md">
                                Business Type / Industry *
                            </label>
                            <IndustryDropdown
                                value={industry}
                                onChange={setIndustry}
                            />
                        </div>

                    </div>


                    <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>

                        <div className='flex flex-col  gap-3'>
                            <label htmlFor="phone">Phone Number *</label>
                            <CustomPhoneInput
                                value={phone}
                                onChange={(val) => setPhone(val)}
                            />
                        </div>
                        <div className='flex flex-col gap-3'>
                            <label className='text-md ' htmlFor="company"> Company Name * </label>
                            <input className='p-2 rounded-lg border border-gray-500 w-full' type="text" />

                        </div>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <PasswordInput
                            label="Password *"

                            show={showPassword}
                            toggle={() => setShowPassword(!showPassword)}
                        />
                        <PasswordInput
                            label="Confirm Password *"
                            show={showPassword}
                            toggle={() => setShowPassword(!showPassword)}
                        />
                    </div>

                    {/* Terms */}
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                        <input type="checkbox" className="mt-1 cursor-pointer" />
                        <p>
                            I agree to the{' '}
                            <span className="text-blue-600 cursor-pointer">Terms of Service</span>{' '}
                            and{' '}
                            <span className="text-blue-600 cursor-pointer">Privacy Policy</span>.
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 btn-primary rounded-lg"
                    >
                        Create Account
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-4">
                        <div className="h-px bg-gray-200 flex-1" />
                        <span className="text-xs text-gray-400">or sign in using</span>
                        <div className="h-px bg-gray-200 flex-1" />
                    </div>

                    {/* Google */}
                    <button
                        type="button"
                        className="w-full border py-3 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition cursor-pointer"
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            className="w-4 h-4"
                        />
                        Continue with Google
                    </button>
                </form>
            </div>
        </section>
    )
}

// /* ---------------- Components ---------------- */



