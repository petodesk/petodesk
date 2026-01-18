import React from 'react'
import Header from '../../components/Header'
import LandingPageHero from '../../components/LandingPageHero'
import BuiltSection from '../../components/BuiltSection'
import Service from '../../components/Service'
import PlanDetails from '../../components/PlanDetails'
import Trail from '../../components/Trail'

export default function LandingPage() {
  return (
    <div>
        <Header/>
      <LandingPageHero/>
      <BuiltSection/>
      <Service/>
      <PlanDetails/>
      <Trail/>
      
    </div>
  )
}
