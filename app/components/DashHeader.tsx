'use client'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/client'
import {
  HiSearchCircle,
} from 'react-icons/hi'
import {
  HiOutlineBell,
  HiOutlineClock,
  HiOutlineUserCircle,
  HiOutlineArrowRightOnRectangle,
  HiBars3BottomRight
} from 'react-icons/hi2'
import logo from '../assets/log.png'

type DashHeaderProps = {
  userName: string
  onToggleSidebar: () => void
}


export default function DashHeader({ userName, onToggleSidebar }: DashHeaderProps) {
  const [time, setTime] = useState(new Date())
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const userDropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()
  const router = useRouter()

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setIsUserDropdownOpen(false)
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <header className="sticky top-0 z-100 bg-white border-b px-4 md:px-8 h-20 flex items-center justify-between">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <Image src={logo} alt="logo" className="h-8 w-auto" />
      </div>

      {/* MIDDLE (Desktop only) */}
      <div className="hidden md:flex flex-col gap-1 text-center">
        <p className="text-sm text-gray-500">{formattedDate}</p>
        <p className="font-semibold">Welcome, {userName}</p>
        <button className="flex items-center justify-center gap-2 text-sm text-blue-600 font-medium">
          <HiOutlineClock size={18} />
          Clock In
        </button>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        <button className="p-2 hidden sm:block">
          <HiSearchCircle size={30} className="text-gray-400" />
        </button>

        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full hidden sm:block">
          <HiOutlineBell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

  

        {/* MOBILE MENU BUTTON */}
        <div className="relative md:hidden" ref={mobileMenuRef}>
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <HiBars3BottomRight size={26} />
          </button>


        </div>

        <p className="hidden md:block text-sm font-bold text-gray-400 ml-2">
          ENG
        </p>
      </div>
    </header>
  )
}
