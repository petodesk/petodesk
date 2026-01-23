import React from 'react'

type PricingCardProps = {
  title: string
  subtitle: string
  features: string[]
  bestFor: string[]
  highlighted?: boolean
}

export default function PricingCard({
  title,
  subtitle,
  features,
  bestFor,
}: PricingCardProps) {
  return (
    <div
      className={`rounded-xl  p-6 flex flex-col shadow-lg justify-between hover:-translate-y-2 duration-400
       `}
    >
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>

      
        <button
          className={`w-full mt-6 py-2 rounded-md text-sm font-medium transition
            btn-primary text-white
             `}
        >
          Contact Sales
        </button>

        <p className="text-sm text-gray-600 text-center mt-3">
          Start a free 30-days trial
        </p>

        {/* Features */}
        <ul className="mt-6 space-y-2 text-md text-gray-700">
          {features.map((feature, index) => (
            <li key={index} className="flex gap-2">
              <span className="text-green-600">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Best for */}
      <div className="mt-6">
        <p className="text-md font-medium text-gray-900">Best for</p>
        <ul className="mt-2 space-y-1 text-sm text-gray-800">
          {bestFor.map((item, index) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
