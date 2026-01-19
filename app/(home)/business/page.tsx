import BusinessCard from '@/app/components/BusinessCards'
import BusinessHero from '@/app/components/BusinessHero'
import Header from '@/app/components/Header'
import ManageB from '@/app/components/ManageB'

function page() {
  return (
    <div>
      <Header/>
      <BusinessHero/>
      <BusinessCard/>
      <ManageB description='Ready to start managing your
business smarter?'/>
    </div>
  )
}

export default page
