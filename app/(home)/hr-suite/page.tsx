import Footer from '@/app/components/Footer'
import Header from '@/app/components/Header'
import HrCard from '@/app/components/HrCards'
import HrHero from '@/app/components/HrHero'
import ManageB from '@/app/components/ManageB'

function page() {
  return (
    <div>
      <Header />
      <HrHero />
      <HrCard />
      <ManageB description="Ready to start simplifying your HR processes?"/>
        <Footer/>
    </div>
  )
}

export default page
