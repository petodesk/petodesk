import Image from 'next/image'
import React from 'react'

import petotrail from '../assets/petodesk.png'
import { FaCheckCircle } from 'react-icons/fa'
import Link from 'next/dist/client/link'

function Trail() {
  return (
    <div className='bg-[#F59E0B] p-6 md:p-12 rounded-t-4xl '>
      <div className='flex flex-col items-center gap-10 md:flex-row justify-between '>
        <div className=''>
          <h1 className='text-xl md:text-2xl lg:text-3xl font-bold pb-10'>Run your business smarter with PetoDesk</h1>
          <div className="flex flex-col md:flex-row justify-center md:justify-between gap-6 md:gap-20">

            <ul className="flex flex-col gap-4 w-full md:w-auto">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-black text-xl mt-1" />
                <span>Free for 30 days</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-black text-xl mt-1" />
                <span>Request a Demo</span>
              </li>
            </ul>

            <ul className="flex flex-col gap-4 w-full md:w-auto">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-black text-xl mt-1" />
                <span>No Credit Card Required</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-black text-xl mt-1" />
                <span>Cancel anytime, no hidden fees</span>
              </li>
            </ul>

          </div>




        </div>


        <div>
          <Image
            src={petotrail}
            alt='trail image'
            className='w-[300px] h-[200px] md:w-[300px] md:[200px] hover:translate-y-2 duration-400'

          />
        </div>


      </div>
      <div className='flex bg-white py-3 px-6 w-50 rounded-lg  mx-auto mt-10 cursor-pointer hover:bg-blue-400 duration-300'>
        <Link href="/signup" className='text-black mx-auto'>
          Start free trial
        </Link>
      </div>


    </div>
  )
}

export default Trail
