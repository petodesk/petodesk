'use client'

import Image from 'next/image'
import logo from '../assets/log.png'
import React, { useState } from 'react'
import { FaGlobe } from 'react-icons/fa'
import { HiMenu, HiX } from 'react-icons/hi'

function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="relative border-b border-gray-300 shadow-sm font-poppins">
      <div className="flex items-center justify-between px-6 py-4">

        {/* Left */}
        <div className="flex items-center gap-10">
          <Image src={logo} alt="logo" />

          {/* Middle menu (desktop only) */}
          <ul className="hidden md:flex gap-10 list-none">
            <li className="cursor-pointer">Business</li>
            <li className="cursor-pointer">HR Suite</li>
            <li className="cursor-pointer">Pricing</li>
            <li className="cursor-pointer">Learn & Support</li>
          </ul>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          <li className="hidden md:flex items-center gap-2 list-none cursor-pointer">
            <FaGlobe />
            English
          </li>

          <li className="list-none cursor-pointer text-primary">Sign In</li>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-2xl"
          >
            {open ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-full left-0 w-full md:hidden border-t border-gray-200 bg-white px-6 py-4 z-100">
          <ul className="flex flex-col gap-4">
            <li className="cursor-pointer">Business</li>
            <li className="cursor-pointer">HR Suite</li>
            <li className="cursor-pointer">Pricing</li>
            <li className="cursor-pointer">Learn & Support</li>
          </ul>
        </div>
      )}
    </header>
  )
}

export default Header
