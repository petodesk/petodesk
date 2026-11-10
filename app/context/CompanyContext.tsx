
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react'
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
  companyStatus: string
  refresh: () => Promise<void>
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export const useCompany = () => {
  const context = useContext(CompanyContext)
  if (!context) throw new Error('useCompany must be used within CompanyProvider')
  return context
}

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  // Create the client once (a new one on every render would re-trigger the effects below)
  const [supabase] = useState(() => createClient())

  const [company, setCompany] = useState<Company | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState<string>('')
  const [companyStatus, setCompanyStatus] = useState<string>('')

  // Which user the data in state belongs to
  const userIdRef = useRef<string | null>(null)
  // Increases on every fetch/sign-out so a slow, older request can never overwrite newer data
  const requestRef = useRef(0)

  // Wipe everything that belongs to the previous user
  const clearState = useCallback(() => {
    userIdRef.current = null
    setProfile(null)
    setCompany(null)
    setCurrency('')
    setCompanyStatus('')
  }, [])

  const fetchCompanyData = useCallback(async () => {
    const requestId = ++requestRef.current
    setLoading(true)

    try {
      // getUser() verifies the session with Supabase (getSession() only reads local storage)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (requestId !== requestRef.current) return

      // Not logged in: clear anything left over from a previous user
      if (!user) {
        clearState()
        return
      }

      // A different account than the one in state: drop the old data immediately
      if (userIdRef.current && userIdRef.current !== user.id) clearState()

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (requestId !== requestRef.current) return

      if (!profileData) {
        clearState()
        return
      }

      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profileData.company_id)
        .single()
      if (requestId !== requestRef.current) return

      userIdRef.current = user.id
      setProfile(profileData)
      setCompany(companyData)
      setCurrency(companyData?.currency || '')
      setCompanyStatus(companyData?.status || '')
    } catch (err) {
      console.error('Failed to fetch company data', err)
    } finally {
      if (requestId === requestRef.current) setLoading(false)
    }
  }, [supabase, clearState])

  useEffect(() => {
    fetchCompanyData()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Logged out (in this tab or another): clear everything and cancel in-flight requests
      if (event === 'SIGNED_OUT') {
        requestRef.current++
        clearState()
        setLoading(false)
        return
      }

      // Logged in as a different account than the one in state: reload
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user?.id !== userIdRef.current) {
          // Deferred: Supabase advises against awaiting its own calls inside this callback
          setTimeout(() => {
            fetchCompanyData()
          }, 0)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchCompanyData, clearState])

  return (
    <CompanyContext.Provider
      value={{
        company,
        profile,
        loading,
        currency,
        companyStatus,
        refresh: fetchCompanyData,
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}
