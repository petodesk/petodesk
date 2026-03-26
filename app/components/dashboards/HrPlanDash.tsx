'use client'
import { createClient } from '@/app/utils/supabase/client'
import { useEffect, useState } from 'react'



export default function OfficeLocationPage() {
  const supabase = createClient()
const[userCompanyId, setUserCompanyId] = useState<any>()
useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('company_id')
                .eq('id', user.id)
                .single()

            setUserCompanyId(profile?.company_id ?? null)
        }

        getUser()
    }, [])






  const getOfficeCoords = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("Location permission denied"))
        } else if (error.code === error.TIMEOUT) {
          reject(new Error("Location request timed out"))
        } else {
          reject(new Error("Failed to get location"))
        }
      },
      {
        enableHighAccuracy: true, // 🔥 important for office check
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}

const handleSetOffice = async () => {
  try {
    const coords = await getOfficeCoords()

    const { error } = await supabase
      .from('companies')
      .update({
        office_lat: coords.lat,
        office_lng: coords.lng,
        allowed_radius: 100
      })
      .eq('id', userCompanyId)

    if (!error) {
      alert("Office location saved!")
    }
  } catch (err: any) {
    console.log(err.message)
  }
}
  
const location = getOfficeCoords()
console.log(location)
  return (
    <div className="p-6 space-y-4">

      <h2 className="text-xl font-bold">Set Office Location</h2>

      <button
   onClick={handleSetOffice}
        className="px-6 py-2 bg-blue-600 text-white rounded-xl"
      >
        Save Location
      </button>

    </div>
  )
}