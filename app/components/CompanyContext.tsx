'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/app/utils/supabase/client'

type Profile = {
  id: string
  full_name: string
  email: string
  phone: string
  role: string
  company_id: string
}

type Company = {
  id: string
  name: string
  industry: string
  service_type: string
  currency: string
  size: string
  location: string
  status: string
}

type CompanyContextType = {
  company: Company | null
  profile: Profile | null
  loading: boolean
  currency: string
  refresh: () => Promise<void>
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export const useCompany = () => {
  const context = useContext(CompanyContext)
  if (!context) throw new Error('useCompany must be used within CompanyProvider')
  return context
}

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient()
  const [company, setCompany] = useState<Company | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const[currency, setCurrency] = useState<string>('')
  const fetchCompanyData = async () => {
    setLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (!user) return

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (!profileData) return
      setProfile(profileData)

      // Get company data
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profileData.company_id)
        .single()
      setCompany(companyData)
      setCurrency(companyData?.currency || '')

    } catch (err) {
      console.error('Failed to fetch company data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanyData()
  }, [])

  return (
    <CompanyContext.Provider
      value={{
        company,
        profile,
        loading,
        currency,
        refresh: fetchCompanyData,
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}