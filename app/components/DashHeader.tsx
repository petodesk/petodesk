'use client'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/client'
import { HiSearchCircle } from 'react-icons/hi'
import {
  HiOutlineBell,
  HiBars3BottomRight
} from 'react-icons/hi2'
import logo from '../assets/log.png'
import AttendanceButton from './AttendanceButton'

type DashHeaderProps = {
  userName: string
  onToggleSidebar: () => void
}

export default function DashHeader({ userName, onToggleSidebar }: DashHeaderProps) {
  const [time, setTime] = useState(new Date())
  const supabase = createClient()
  const router = useRouter()

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])


  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <header className="sticky top-0 z-[100] bg-white border-b px-4 md:px-8 h-20 flex items-center justify-between shadow-sm">
      
      {/* LEFT: Logo & User Welcome */}
      <div className="flex items-center gap-6">
        <Image src={logo} alt="logo" className="w-20 md:w-30" />
        
        <div className="hidden lg:block h-8 w-[1px] bg-gray-200"></div>
        
        <div className="hidden md:flex flex-col">
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{formattedDate}</p>
          <h1 className="text-gray-800 font-bold">Welcome, <span className="text-blue-600">{userName}</span></h1>
        </div>
      </div>

      {/* RIGHT: Attendance & Actions */}
      <div className="flex items-center gap-2 md:gap-6">
        
        {/* ATTENDANCE SECTION */}
        <div className="flex flex-col items-end border-r pr-6 border-gray-100">
           <div className="w-30 sm:w-40">
             <AttendanceButton />
           </div>
           <div className="hidden md:flex items-center gap-1.5 mt-1">
             <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
             </span>
             <p className="text-[10px] text-gray-400 italic font-medium">GPS location active</p>
           </div>
        </div>

        {/* ICON BUTTONS */}
        <div className="flex items-center gap-1 md:gap-3">
          <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors hidden sm:block">
            <HiSearchCircle size={28} />
          </button>

          <button className="hidden md:block relative p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
            <HiOutlineBell size={24} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          <p className="hidden md:block text-xs font-black text-gray-300 ml-2 tracking-tighter">
            ENG
          </p>

          {/* MOBILE TOGGLE */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <HiBars3BottomRight size={28} />
          </button>
          
        
        </div>
      </div>
    </header>
  )
}