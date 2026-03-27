// 'use client'
// import { createClient } from '@/app/utils/supabase/client'
// import { useEffect, useState } from 'react'



// export default function OfficeLocationPage() {
//   const supabase = createClient()
// const[userCompanyId, setUserCompanyId] = useState<any>()


// useEffect(() => {
//         const getUser = async () => {
//             const { data: { user } } = await supabase.auth.getUser()
//             if (!user) return

//             const { data: profile } = await supabase
//                 .from('profiles')
//                 .select('company_id')
//                 .eq('id', user.id)
//                 .single()

//             setUserCompanyId(profile?.company_id ?? null)
//         }

//         getUser()
//     }, [])






//   const getOfficeCoords = (): Promise<{ lat: number; lng: number }> => {
//   return new Promise((resolve, reject) => {
//     if (!navigator.geolocation) {
//       reject(new Error("Geolocation not supported"))
//       return
//     }

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         resolve({
//           lat: pos.coords.latitude,
//           lng: pos.coords.longitude
//         })
//       },
//       (error) => {
//         if (error.code === error.PERMISSION_DENIED) {
//           reject(new Error("Location permission denied"))
//         } else if (error.code === error.TIMEOUT) {
//           reject(new Error("Location request timed out"))
//         } else {
//           reject(new Error("Failed to get location"))
//         }
//       },
//       {
//         enableHighAccuracy: true, // 🔥 important for office check
//         timeout: 10000,
//         maximumAge: 0
//       }
//     )
//   })
// }

// const handleSetOffice = async () => {
//   try {
//     const coords = await getOfficeCoords()

//     const { error } = await supabase
//       .from('companies')
//       .update({
//         office_lat: coords.lat,
//         office_lng: coords.lng,
//         allowed_radius: 300
//       })
//       .eq('id', userCompanyId)

//     if (!error) {
//       alert("Office location saved!")
//     }
//   } catch (err: any) {
//     console.log(err.message)
//   }
// }
  

//   return (
//     <div className="p-6 space-y-4">

//       <h2 className="text-xl font-bold">Set Office Location</h2>
      
      

//       <button
//    onClick={handleSetOffice}
//         className="px-6 py-2 bg-blue-600 text-white rounded-xl"
//       >
//         Save Location
//       </button>

//     </div>
//   )
// }

'use client'
import { createClient } from '@/app/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function OfficeLocationPage() {
  const supabase = createClient()

  const [userCompanyId, setUserCompanyId] = useState<any>(null)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [companyCoords, setCompanyCoords] = useState<{ lat: number; lng: number } | null>(null)

  // ✅ Get user + company
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

      // ✅ Fetch company location
      if (profile?.company_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('office_lat, office_lng')
          .eq('id', profile.company_id)
          .single()

        if (company) {
          setCompanyCoords({
            lat: company.office_lat,
            lng: company.office_lng
          })
        }
      }
    }

    getUser()
  }, [])

  // ✅ Get user location
  const getOfficeCoords = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }
          setUserCoords(coords) // ✅ save to state
          resolve(coords)
        },
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  // ✅ Save office location
  const handleSetOffice = async () => {
    try {
      const coords = await getOfficeCoords()

      const { error } = await supabase
        .from('companies')
        .update({
          office_lat: coords.lat,
          office_lng: coords.lng,
          allowed_radius: 300
        })
        .eq('id', userCompanyId)

      if (!error) {
        alert("Office location saved!")
        setCompanyCoords(coords) // update UI instantly
      }
    } catch (err: any) {
      console.log(err.message)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Office Location Debug</h2>

      {/* ✅ User Location */}
      <div className="bg-gray-100 p-4 rounded-xl">
        <p className="font-semibold">👤 Your Location:</p>
        {userCoords ? (
          <p>{userCoords.lat}, {userCoords.lng}</p>
        ) : (
          <button
            onClick={getOfficeCoords}
            className="mt-2 px-4 py-1 bg-green-600 text-white rounded"
          >
            Get My Location
          </button>
        )}

      </div>

      {/* ✅ Company Location */}
      <div className="bg-gray-100 p-4 rounded-xl">
        <p className="font-semibold">🏢 Company Location:</p>
        {companyCoords ? (
          <p>{companyCoords.lat}, {companyCoords.lng}</p>
        ) : (
          <p className="text-red-500">Not set</p>
        )}
      </div>

      {/* ✅ Save Button */}
      <button
        onClick={handleSetOffice}
        className="px-6 py-2 bg-blue-600 text-white rounded-xl"
      >
        Save Office Location
      </button>
    </div>
  )
}