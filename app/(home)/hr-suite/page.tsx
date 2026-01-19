import Header from '@/app/components/Header'
import HrCard from '@/app/components/HrCards'
import HrHero from '@/app/components/HrHero'
import ManageB from '@/app/components/ManageB'
import React from 'react'

function page() {
  return (
    <div>
        <Header/>
        <HrHero/>
        <HrCard/>
        <ManageB description="Ready to start simplifying you
 HR processes?"/>
      
    </div>
  )
}

export default page
