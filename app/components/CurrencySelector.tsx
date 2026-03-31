'use client'

import { useState } from "react"
import CreatableSelect from "react-select/creatable"

export default function CurrencySelect({
  onChange
}: {
  onChange?: (currency: string) => void
}) {
  const [value, setValue] = useState<any>(null)

  const options = [
    { value: "USD", label: "US Dollar ($)" },
    { value: "EUR", label: "Euro (€)" },
    { value: "GBP", label: "British Pound (£)" },
    { value: "ETB", label: "Ethiopian Birr (Br)" },
    { value: "KES", label: "Kenyan Shilling (KSh)" },
    { value: "NGN", label: "Nigerian Naira (₦)" },
    { value: "INR", label: "Indian Rupee (₹)" },
    { value: "AED", label: "UAE Dirham (د.إ)" },
    { value: "CAD", label: "Canadian Dollar ($)" },
    { value: "AUD", label: "Australian Dollar ($)" },
  ]

  return (
    <div className="w-full">
      <CreatableSelect
        options={options}
        value={value}
        placeholder="Select or type currency (e.g. USD)"
        onChange={(selected: any) => {
          setValue(selected)
          onChange?.(selected?.value)
        }}
        isClearable
      />
    </div>
  )
}