'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FeatureDropdown from '@/app/components/FeatureDropdown'
import IndustryDropdown from '@/app/components/IndustryDropdown'
import CustomPhoneInput from '@/app/components/PhoneInput'
import { createClient } from '@/app/utils/supabase/client'
import { validatePhone } from '@/app/utils/validatePhone'

export default function CompanySetup() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [countryCode, setCountryCode] = useState('US')

  const [feature, setFeature] = useState<string | null>(null)
  const [industry, setIndustry] = useState<string | null>(null)
  const [location, setLocation] = useState('')
  const [size, setSize] = useState('Small')

  /* ---------------- Auth Guard ---------------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
    })
  }, [router])

  /* ---------------- Submit ---------------- */
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { valid, error } = validatePhone({ phone })
    if (!valid) {
      setPhoneError(error!)
      setLoading(false)
      return
    }

    if (!feature || !industry) {
      alert('Please select feature and industry')
      setLoading(false)
      return
    }

    setPhoneError('')

    try {
const { data: sessionData } = await supabase.auth.getSession()
const user = sessionData.session?.user
if (!user) throw new Error('Not authenticated')

/* ---- PREVENT DUPLICATE COMPANY ---- */
const { data: existingCompany } = await supabase
  .from('companies')
  .select('id')
  .eq('owner_id', user.id)
  .single()

if (existingCompany) {
  router.push('/')
  return
}

/* ---- CREATE COMPANY ---- */
const { data: company, error: companyError } = await supabase
  .from('companies')
  .insert({
    name: companyName,
    industry,
    service_type: feature,
    owner_id: user.id,
    size,
    location,
  })
  .select()
  .single()

if (companyError) throw companyError

/* ---- UPSERT PROFILE ---- */
const { error: profileError } = await supabase
  .from('profiles')
  .upsert({
    id: user.id,
    full_name: fullName,
    phone,
    email: user.email,
    company_id: company.id,
  })

if (profileError) throw profileError

    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center px-4 font-poppins">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm px-10 py-6 my-10">

        {/* Header */}
        <div className="text-right text-sm mb-6">
          <span className="text-gray-500">Have a PetoDesk? </span>
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            SIGN IN
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create your business account
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateCompany} className="space-y-8">

          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-2">
              <label>Full Name *</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="p-2 rounded-lg border border-gray-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label>Company Name *</label>
              <input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="p-2 rounded-lg border border-gray-500"
              />
            </div>
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-2">
              <label>Choose Your Features *</label>
              <FeatureDropdown value={feature} onChange={setFeature} />
            </div>

            <div className="flex flex-col gap-2">
              <label>Business Type / Industry *</label>
              <IndustryDropdown value={industry} onChange={setIndustry} />
            </div>
          </div>

          {/* Phone & Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-2">
              <label>Phone Number *</label>
              <CustomPhoneInput
                value={phone}
                onChange={setPhone}
                onCountryChange={(c) => {
                  setCountryCode(c.iso2)
                  setLocation(c.name)
                }}
                onBlur={() => {
                  if (!phone) return
                  const result = validatePhone({ phone })
                  setPhoneError(result.valid ? '' : result.error!)
                }}
              />
              {phoneError && (
                <p className="text-sm text-red-600">{phoneError}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label>Company Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="p-2 rounded-lg border border-gray-500"
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>
          </div>

          {/* Location (auto) */}
          <div className="flex flex-col gap-2 md:w-1/2">
            <label>Company Location</label>
            <input
              value={location}
              readOnly
              className="p-2 rounded-lg border border-gray-300 bg-gray-100"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:bg-blue-300"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>
      </div>
    </section>
  )
}
