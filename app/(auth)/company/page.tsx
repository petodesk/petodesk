'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FeatureDropdown from '@/app/components/FeatureDropdown'
import IndustryDropdown from '@/app/components/IndustryDropdown'
import CustomPhoneInput from '@/app/components/PhoneInput'
import { createClient } from '@/app/utils/supabase/client'
import { validatePhone } from '@/app/utils/validatePhone'
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'
import { Loading } from '@/app/components/Loading'

export default function CompanySetup() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [countryCode, setCountryCode] = useState('US')

  // const [feature, setFeature] = useState<string | null>(null)
  const [industry, setIndustry] = useState<string | null>(null)
  const [location, setLocation] = useState('')
  const [size, setSize] = useState('Small')
  const [sessionCheck, setSessionCeck] = useState(false)
  const [acquisition, setAcquisition] = useState('')
  /* ---------------- Auth Guard ---------------- */
  useEffect(() => {
    setSessionCeck(true)
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user
      if (!user) {
        setSessionCeck(false)
        router.push('/login')
      }


      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.session?.user.id)
        .single()

      if (!profile) {
        setSessionCeck(false)
        return;
      } else {
        router.push('/dashboard')
      }
    }

    checkUser()
  }, [])

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

    if (!industry) {
      toast.error('Please select industry!')
      setLoading(false)
      return
    }

    setPhoneError('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) throw new Error('Not authenticated')

      /* ---- SINGLE RPC CALL ---- */
      const { error: rpcError } = await supabase.rpc(
        'create_company_and_profile',
        {
          p_company_name: companyName,
          p_industry: industry,
          p_service_type: 'inventory',
          p_owner_id: user.id,
          p_size: size,
          p_location: location,
          p_full_name: fullName,
          p_phone: phone,
          p_email: user.email,
          p_acquisition: acquisition,
        }
      )

      if (rpcError) throw rpcError

      router.push('/success')
    } catch (err: any) {
      alert(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }
  if (sessionCheck) {
    return <Loading />
  }

  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center px-4 font-poppins">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm px-10 py-6 my-10">


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
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-10"> */}
          {/* <div className="flex flex-col gap-2">
              <label>Choose Your Features *</label>
              <FeatureDropdown value={feature} onChange={setFeature} />
            </div> */}


          {/* </div> */}

          {/* Phone & Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-2">
              <label>Business Type / Industry *</label>
              <IndustryDropdown value={industry} onChange={setIndustry} />
            </div>
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
            <div className="flex flex-col gap-2">
              <label>Company Location</label>
              <input
                value={location}
                readOnly
                className="p-2 rounded-lg border border-gray-300 bg-gray-100"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label>Where did you hear about us? *</label>

              <select
                required
                value={acquisition}
                onChange={(e) => setAcquisition(e.target.value)}
                className="p-2 rounded-lg border border-gray-500"
              >
                <option value="">Select</option>
                <option value="tiktok">TikTok</option>
                <option value="telegram">Telegram</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter (X)</option>
                <option value="google">Google Search</option>
                <option value="referral">Friend / Referral</option>
                <option value="youtube">YouTube</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>



          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:bg-blue-300 cursor-pointer"
          >
            {loading ?
              <div className="flex items-center justify-center gap-2">
                <ClipLoader size={20} color="#ffffff" />
                <span>Creating Company...</span>
              </div> : 'Create Company Account'}
          </button>

        </form>
      </div>
    </section>
  )
}
