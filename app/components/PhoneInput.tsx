'use client'

import { useState } from 'react'
import Select, {
  SingleValue,
  StylesConfig,
  FormatOptionLabelMeta,
  components,
} from 'react-select'
import countries from 'country-telephone-data'

type CountryOption = {
  value: string
  label: string
}

type Props = {
  value?: string
  onChange?: (phone: string) => void
}

export default function CustomPhoneInput({ onChange }: Props) {
  const [countryCode, setCountryCode] = useState('+1')
  const [phoneNumber, setPhoneNumber] = useState('')

  const countryOptions: CountryOption[] = countries.allCountries.map(
    (country) => ({
      value: `+${country.dialCode}`,
      label: country.name,
    })
  )

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
      paddingLeft: '2px',
      paddingRight: '28px', // space for arrow
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: '0 4px',
      color: '#6B7280',
      fontWeight:"bold"
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

  const emitChange = (code: string, phone: string) => {
    onChange?.(`${code}${phone}`)
  }

  return (
    <div className="w-full">
      <div className="flex w-full border-2 border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-gray-500">
        {/* Country Code */}
        <div className="relative w-30 border-r border-gray-300">
          <Select<CountryOption, false>
            options={countryOptions}
            value={countryOptions.find(
              (opt) => opt.value === countryCode
            )}
            onChange={(selected: SingleValue<CountryOption>) => {
              const code = selected?.value || ''
              setCountryCode(code)
              emitChange(code, phoneNumber)
            }}
            styles={selectStyles}
            placeholder="Code"
            components={{
              IndicatorSeparator: () => null,
            }}
            formatOptionLabel={(
              option: CountryOption,
              meta: FormatOptionLabelMeta<CountryOption>
            ) =>
              meta.context === 'menu' ? (
                <div className="flex justify-between">
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

        {/* Phone Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '')
            setPhoneNumber(val)
            emitChange(countryCode, val)
          }}
          className="w-full h-[44px] px-3 outline-none text-sm"
          placeholder="Enter phone number"
        />
      </div>
    </div>
  )
}
