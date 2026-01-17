import Image from 'next/image'
import React from 'react'
import { FaCheckCircle } from 'react-icons/fa'
import planimg from '../assets/plan.png'

function PlanDetails() {
  return (
    <div className='flex flex-col justify-between gap-20 py-12 px-10'>
      <div className='flex flex-col justify-between gap-6'>
        <h1 className='text-xl md:text-3xl font-bold text-center'>Everything Your Business Needs in One Platform. Total business control.</h1>
        <p className='text-sm font-semibold text-center'>Manage sales, inventory, staff, payroll, HR, and reports from a single dashboard — built for growing businesses.</p>
      </div>


      <div className='bg-blue-700 rounded-lg py-10 px-4 hover:-translate-y-2 duration-300 font-poppins'>
        <h1 className='text-xl md:2xl font-semibold text-white py-6'>What’s included</h1>
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3 '>

        <div className='flex flex-col gap-5'>
            <li className='flex gap-2 font-semibold text-white'>
           <FaCheckCircle className="text-orange-500 text-xl" />
                
                Per-employee pricing
            </li>
              <li className='flex gap-2 font-semibold text-white'>
           <FaCheckCircle className="text-orange-500 text-xl" />
                
                Secure data backup & export
            </li>

              <li className='flex gap-2 font-semibold text-white'>
           <FaCheckCircle className="text-orange-500 text-xl" />
              Sales, expenses & inventory tracking
            </li>

              <li className='flex gap-2 font-semibold text-white'>
                
           <FaCheckCircle className="text-orange-500 text-xl" />
               Task, payroll & leave management
            </li>

             <li className='flex gap-2 font-semibold text-white'>
                
           <FaCheckCircle className="text-orange-500 text-xl" />
           Admin & role-based access
            </li>
            
        </div>
        <div className='flex flex-col gap-5'>
            <li className='flex gap-2 font-semibold text-white'>
           <FaCheckCircle className="text-orange-500 text-xl" />
                
                Per-employee pricing
            </li>
              <li className='flex gap-2 font-semibold text-white'>
           <FaCheckCircle className="text-orange-500 text-xl" />
                
                Secure data backup & export
            </li>

              <li className='flex gap-2 font-semibold text-white'>
           <FaCheckCircle className="text-orange-500 text-xl" />
              Sales, expenses & inventory tracking
            </li>

              <li className='flex gap-2 font-semibold text-white'>
                
           <FaCheckCircle className="text-orange-500 text-xl" />
               Task, payroll & leave management
            </li>

             <li className='flex gap-2 font-semibold text-white'>
                
           <FaCheckCircle className="text-orange-500 text-xl" />
           Admin & role-based access
            </li>
            
        </div>
        <div>
            <Image
            src={planimg}
            alt='plan image'
            className='w-[400px]'
            />
        </div>
      </div>
      <div className='flex bg-white py-3 px-6 w-50 rounded-lg items-center mx-auto mt-10 cursor-pointer hover:bg-blue-400 duration-300'>
        <p className='text-gray-900'>View plan details</p>
      </div>
        </div>

    </div>
  )
}

export default PlanDetails
