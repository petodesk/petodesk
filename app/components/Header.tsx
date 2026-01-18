'use client'

import Image from 'next/image'
import logo from '../assets/log.png'
import React, { useEffect, useState } from 'react'
import { FaGlobe } from 'react-icons/fa'
import { HiMenu, HiX } from 'react-icons/hi'
import Link from 'next/link'

function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

   useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      setScrolled(isScrolled)

      // auto close mobile menu on scroll
      if (isScrolled) setOpen(false)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 font-poppins z-50 transition-all duration-300 border-b border-gray-200
    ${
      scrolled
        ? 'bg-white/90 backdrop-blur border-b border-gray-200 shadow-md'
        : 'bg-transparent'
    }
  `}>
      <div className="flex items-center justify-between px-6 py-4">

        {/* Left */}
        <div className="flex items-center gap-10">
          <Link href='/'>
          <Image src={logo} alt="logo" />

          </Link>

          {/* Middle menu (desktop only) */}
         <ul className="hidden md:flex gap-10 list-none">
  <li>
    <Link href="/business" className="cursor-pointer hover:text-primary">
      Business
    </Link>
  </li>
  <li>
    <Link href="/hr-suite" className="cursor-pointer hover:text-primary">
      HR Suite
    </Link>
  </li>
  <li>
    <Link href="/pricing" className="cursor-pointer hover:text-primary">
      Pricing
    </Link>
  </li>
  <li>
    <Link href="/learn-support" className="cursor-pointer hover:text-primary">
      Learn & Support
    </Link>
  </li>
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
  <div className="absolute top-full left-0 w-full md:hidden border-t border-gray-200 bg-white px-6 py-4 z-50">
    <ul className="flex flex-col gap-4">
      <li>
        <Link
          href="/business"
          onClick={() => setOpen(false)}
          className="cursor-pointer block"
        >
          Business
        </Link>
      </li>
      <li>
        <Link
          href="/hr-suite"
          onClick={() => setOpen(false)}
          className="cursor-pointer block"
        >
          HR Suite
        </Link>
      </li>
      <li>
        <Link
          href="/pricing"
          onClick={() => setOpen(false)}
          className="cursor-pointer block"
        >
          Pricing
        </Link>
      </li>
      <li>
        <Link
          href="/learn-support"
          onClick={() => setOpen(false)}
          className="cursor-pointer block"
        >
          Learn & Support
        </Link>
      </li>
    </ul>
  </div>
)}

    </header>
  )
}

export default Header
