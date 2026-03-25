'use client'

import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";

export default function AttendanceButton() {
  const [attendanceRecord, setAttendanceRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const supabase = createClient();

  // Check status on load
  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

  const getCoords = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve("Not Supported");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`),
        () => resolve("Permission Denied"),
        { timeout: 5000 }
      );
    });
  };

  const handleClockIn = async () => {
    setIsProcessing(true);
    const coords = await getCoords();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('attendance')
      .insert([{
        user_id: user?.id,
        clock_in: new Date().toISOString(),
        location_in: coords,
        status: 'Active'
      }])
      .select().single();
      
    if (!error) setAttendanceRecord(data);
    setIsProcessing(false);
  };

  const handleClockOut = async () => {
    setIsProcessing(true);
    const coords = await getCoords();
    
    const { error } = await supabase
      .from('attendance')
      .update({
        clock_out: new Date().toISOString(),
        location_out: coords,
        status: 'Completed'
      })
      .eq('id', attendanceRecord.id);

    if (!error) setAttendanceRecord(null);
    setIsProcessing(false);
  };

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