'use client'

import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";

export default function AttendanceButton() {
  const [attendanceRecord, setAttendanceRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const[userCompanyId,setUserCompanyId] = useState()
  const supabase = createClient();

  // Check status on load
  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('company_id')
                .eq('id', user.id)
                .single()

            setUserCompanyId(profile?.company_id ?? null)
    

      const today = new Date().toISOString().split('T')[0];

      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .is('clock_out', null)
        .single();

      setAttendanceRecord(data);
      setLoading(false);
    };
    checkStatus();
  }, [supabase]);


  function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}

  // get user location or cords//
  const getCoords = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Not supported")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
      },
      () => reject("Permission denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}

 const handleClockIn = async () => {
  setIsProcessing(true)

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No user")

    // ✅ 1. Get employee location
    const coords = await getCoords()

    // ✅ 2. Get company location
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('office_lat, office_lng, allowed_radius')
      .eq('id', userCompanyId)
      .single()

    if (companyError || !company) {
      throw new Error("Company location not set")
    }

    // ✅ 3. Calculate distance
    const distance = getDistance(
      coords.lat,
      coords.lng,
      company.office_lat,
      company.office_lng
    )

    console.log("Distance:", distance)

    // ✅ 4. Validate
    if (distance > company.allowed_radius) {
      alert("You are outside the office area ❌")
      setIsProcessing(false)
      return
    }

    // ✅ 5. Insert attendance
    const { data, error } = await supabase
      .from('attendance')
      .insert([{
        user_id: user.id,
        company_id: userCompanyId,
        clock_in: new Date().toISOString(),
        location_in: `${coords.lat}, ${coords.lng}`,
        status: 'Active'
      }])
      .select()
      .single()

    if (error) throw error

    setAttendanceRecord(data)

  } catch (err: any) {
    alert(err.message)
    console.error(err)
  }

  setIsProcessing(false)
}

 const handleClockOut = async () => {
  setIsProcessing(true);

  try {
    // ✅ 1. Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No user")

    // ✅ 2. Get current location
    const coords = await getCoords()

    // ✅ 3. Get company location
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('office_lat, office_lng, allowed_radius')
      .eq('id', userCompanyId)
      .single()

    if (companyError || !company) {
      throw new Error("Company location not set")
    }

    // ✅ 4. Calculate distance
    const distance = getDistance(
      coords.lat,
      coords.lng,
      company.office_lat,
      company.office_lng
    )

    console.log("Clock-out distance:", distance)

    // ✅ 5. Check if inside office
    const isVerified = distance <= company.allowed_radius

    // ✅ 6. Update attendance
    const { error } = await supabase
      .from('attendance')
      .update({
        clock_out: new Date().toISOString(),
        location_out: `${coords.lat}, ${coords.lng}`,
        status: 'Completed',
        distance_out: distance,
        is_verified_out: isVerified
      })
      .eq('id', attendanceRecord.id)

    if (error) throw error

    // ✅ Optional message
    if (!isVerified) {
      alert(`Clocked out outside office (${Math.round(distance)}m) ❌`)
    }

    setAttendanceRecord(null)

  } catch (err: any) {
    alert(err.message)
    console.error(err)
  }

  setIsProcessing(false)
}

  if (loading) return <div className="h-10 w-32 bg-gray-100 animate-pulse rounded-lg"></div>;

  return (
    <div className="flex flex-col items-center gap-2">
      {!attendanceRecord ? (
        <button 
          disabled={isProcessing}
          onClick={handleClockIn}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold transition-all disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Clock In'}
        </button>
      ) : (
        <button 
          disabled={isProcessing}
          onClick={handleClockOut}
          className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold transition-all disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Clock Out'}
        </button>
      )}
    </div>
  );
}