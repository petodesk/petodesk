'use client'

import { useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'


type FeatureDropdownProps = {
  value: string | null
  onChange: (value: string) => void
}

const features = [
  {
    id: 'hr',
    title: 'HR Management',
    desc: `HR Management -  Employees • Expenses • Payroll • Leave • Tasks
• Invoicing • HR Analytics • Report`,
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    desc: 'Inventory Management -  Stock • Sales • Expenses • IReports',
  },
  {
    id: 'both',
    title: 'HR & Inventory',
    desc: 'Complete business management solution',
  },
]

export default function FeatureDropdown({ value, onChange }: FeatureDropdownProps) {
  const [open, setOpen] = useState(false)

  const selected = features.find(f => f.id === value)

  return (
    <div className="">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-3 border border-gray-500 rounded-lg flex justify-between items-center text-sm"
      >
        <span className="text-gray-700">
          {selected ? selected.title : 'Pick the features'}
        </span>
        <FaChevronDown className={`size-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 max-w-xl bg-white border rounded-lg shadow-lg p-4 space-y-4">
            <span className="text-gray-700">
          {selected ? selected.title : 'Pick the features that suit your business'}
        </span>
          {features.map(feature => (
            <label
              key={feature.id}
              className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md"
            >
              <input
                type="radio"
                name="feature"
                checked={value === feature.id}
                onChange={() => {
                  onChange(feature.id)
                  setOpen(false)
                }}
                className="mt-1 accent-blue-600"
              />

              <div>
                <p className="font-medium text-sm">{feature.title}</p>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
