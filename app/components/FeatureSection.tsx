// components/FeatureSection.tsx
import Image, { StaticImageData } from 'next/image'
import FeatureSectionProps from '../types/feature'

export default function FeatureSection({
  title,
  description,
  features,
  image,
  bgColor = 'bg-white',
  reverse = false,
  whiteDot=false

}: FeatureSectionProps) {
  return (
    <section className={`${bgColor} py-10 my-6 px-10 font-poppins`}>
      
      <div
  className={`max-w-8xl mx-auto px-6 flex flex-col gap-10 items-center
    md:flex-row md:justify-between
    ${reverse ? 'md:flex-row-reverse' : ''}
  `}
>

        {/* Text */}
        <div className='max-w-150'>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{title}</h2>
          <p className="mb-4">{description}</p>

          <ul className="space-y-1">
            <h1 className='text-xl font-bold'>Features:</h1>

            {features.map((item, i) => (
        

              <li key={i} className="flex items-start gap-2">
                <span className={`${whiteDot?"text-white":"text-black "} font-bold`}>•</span>
                <span>{item}</span>
              </li>
            
            ))}
          </ul>
        </div>

        {/* Image */}
        <div className="relative">
          <Image
            src={image}
            alt={title}
            className="w-[300px] h-auto transition-transform duration-300 hover:scale-105"
            priority
          />
        </div>
      </div>
    </section>
  )
}
