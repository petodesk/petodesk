import Image from 'next/image'
import React from 'react'
import salesex from  '../assets/s&e.png'
import inventory from  '../assets/inv.png'
import hr from  '../assets/hr.png'
import task from  '../assets/task.png'
import report from '../assets/rep.png'
import ServiceCard from './ServiceCard'
function Service() {
  return (
    <div className='bg-[#E1B12C] py-12 rounded-lg  p-10 font-poppins'
    >
        <div className='mb-5'>
            <h1 className='text-center text-lg md:text-3xl font-bold'>Everything Your Business Needs in One Platform</h1>

        </div>
        <div className='hidden md:flex bg-[#EAC869] justify-between items-center  rounded-md px-10 py-4'>
            <li className='flex gap-2'>
                <Image src={salesex} alt=''/>
                <p className='font-semibold text-gray-900'>Sales & Expenses</p>

            </li>
            <li className='flex gap-2'>
                <Image src={inventory} alt=''/>
                <p className='font-semibold text-gray-900'>Inventory & Operations</p>

            </li>
            <li className='flex gap-2'>
                <Image src={hr} alt=''/>
                <p className='font-semibold text-gray-900'>HR & Payroll</p>

            </li>
            <li className='flex gap-2'>
                <Image src={task} alt=''/>
                <p className='font-semibold text-gray-900'>Task Management</p>

            </li>
            <li className='flex gap-2'>
                <Image src={report} alt=''/>
                <p className='font-semibold text-gray-900'>Reporting & Analytics</p>

            </li>
        </div>
        <ServiceCard/>
      
    </div>
  )
}

export default Service
