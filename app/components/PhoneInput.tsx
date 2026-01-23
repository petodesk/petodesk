'use client'

import { useState } from 'react'
import Select, {
  SingleValue,
  StylesConfig,
  FormatOptionLabelMeta,
} from 'react-select'
import countries from 'country-telephone-data'

/* ---------------- Types ---------------- */

type CountryOption = {
  value: string // +251
  label: string // Ethiopia
}

type CountryMeta = {
  name: string
  iso2: string
  dialCode: string
}

type Props = {
  value?: string
  onBlur?: () => void
  onChange?: (phone: string) => void
  onCountryChange?: (country: CountryMeta) => void
}

/* ---------------- Component ---------------- */

export default function CustomPhoneInput({
  value,
  onChange,
  onCountryChange,
  onBlur
}: Props) {
  const [countryCode, setCountryCode] = useState('+1')
  const [phoneNumber, setPhoneNumber] = useState('')

  /* ---------------- Countries ---------------- */

  const countryOptions: CountryOption[] = countries.allCountries.map(
    (country) => ({
      value: `+${country.dialCode}`,
      label: country.name,
    })
  )

  /* ---------------- Helpers ---------------- */

  const emitPhoneChange = (code: string, phone: string) => {
    onChange?.(`${code}${phone}`)
  }

  const handleCountrySelect = (
    selected: SingleValue<CountryOption>
  ) => {
    if (!selected) return

    const matchedCountry = countries.allCountries.find(
      (c) => `+${c.dialCode}` === selected.value
    )

    setCountryCode(selected.value)
    emitPhoneChange(selected.value, phoneNumber)

    if (matchedCountry) {
      onCountryChange?.({
        name: matchedCountry.name,
        iso2: matchedCountry.name,
        dialCode: matchedCountry.dialCode,
      })
    }
  }

  /* ---------------- Styles ---------------- */

  const selectStyles: StylesConfig<CountryOption, false> = {
    control: (base) => ({
      ...base,
      height: '44px',
      minHeight: '44px',
      border: 'none',
      boxShadow: 'none',
      cursor: 'pointer',
    }),
    valueContainer: (base) => ({
      ...base,
      paddingLeft: '6px',
      paddingRight: '28px',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: '0 6px',
      color: '#6B7280',
      fontWeight: 'bold',
    }),
    indicatorsContainer: (base) => ({
      ...base,
      position: 'absolute',
      right: '6px',
      height: '44px',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
    }),
  }

  /* ---------------- Render ---------------- */

  return (
    <div className="w-full">
      <div className="flex w-full border-2 border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-gray-500">
        {/* Country Code Select */}
        <div className="relative w-32 border-r border-gray-300">
          <Select<CountryOption, false>
            options={countryOptions}
            value={countryOptions.find(
              (opt) => opt.value === countryCode
            )}
            onChange={handleCountrySelect}
            styles={selectStyles}
            placeholder="Code"
            components={{ IndicatorSeparator: () => null }}
            formatOptionLabel={(
              option: CountryOption,
              meta: FormatOptionLabelMeta<CountryOption>
            ) =>
              meta.context === 'menu' ? (
                <div className="flex justify-between gap-4">
                  <span>{option.label}</span>
                  <span className="text-gray-500 text-sm">
                    {option.value}
                  </span>
                </div>
              ) : (
                <span>{option.value}</span>
              )
            }
          />
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onBlur={onBlur}
          onChange={(e) => {
            const digitsOnly = e.target.value.replace(/\D/g, '')
            setPhoneNumber(digitsOnly)
            emitPhoneChange(countryCode, digitsOnly)
          }}
          className="w-full h-[44px] px-3 outline-none text-sm"
          placeholder="Enter phone number"
        />
      </div>
    </div>
  )
}
