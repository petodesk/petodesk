'use client'

import { useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'

type IndustryDropdownProps = {
  value: string | null
  onChange: (value: string) => void
}

const industries = [
  {
    id: 'technology',
    title: 'Technology / Software',
    desc: 'SaaS, IT services, software companies',
  },
  {
    id: 'retail',
    title: 'Retail & E-commerce',
    desc: 'Online stores, physical shops, marketplaces',
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Medical',
    desc: 'Clinics, hospitals, medical services',
  },
  {
    id: 'finance',
    title: 'Finance & Financial Services',
    desc: 'Banks, fintech, accounting firms',
  },
  {
    id: 'hr',
    title: 'Human Resources / Recruitment',
    desc: 'HR agencies, staffing, talent management',
  },
]

export default function IndustryDropdown({
  value,
  onChange,
}: IndustryDropdownProps) {
  const [open, setOpen] = useState(false)

  const selected = industries.find(i => i.id === value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-3 border border-gray-500 rounded-lg flex justify-between items-center text-sm bg-white"
      >
        <span className="text-gray-700">
          {selected ? selected.title : 'Select your business type'}
        </span>

        <FaChevronDown
          className={`text-sm transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg p-4 space-y-4">
          {industries.map(industry => (
            <label
              key={industry.id}
              className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition"
            >
              <input
                type="radio"
                name="industry"
                checked={value === industry.id}
                onChange={() => {
                  onChange(industry.id)
                  setOpen(false)
                }}
                className="mt-1 accent-blue-600"
              />

              <div>
                <p className="font-medium text-sm text-gray-800">
                  {industry.title}
                </p>
                <p className="text-xs text-gray-500">
                  {industry.desc}
                </p>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
