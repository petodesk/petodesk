import { StaticImageData } from "next/image"

export default interface FeatureSectionProps {
  title: string
  description: string
  features: string[]
  image: StaticImageData
  bgColor?: string
  reverse?: boolean
  whiteDot?:boolean
}
