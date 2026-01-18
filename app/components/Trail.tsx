import Image from 'next/image'
import React from 'react'

import petotrail from '../assets/petodesk.png'
import { FaCheckCircle } from 'react-icons/fa'

function Trail() {
    return (
        <div className='bg-[#F59E0B] p-6 md:p-12 rounded-t-4xl '>
        <div className='flex flex-col gap-10 md:flex-row justify-between'>
            <div className=''>
                <h1 className='text-xl md:text-2xl lg:text-3xl font-bold pb-10'>Run your business smarter with PetoDesk</h1>
                <div className='flex flex-col md:flex-row justify-between gap-5 md:gap-20'>
                    <ul className='flex flex-col gap-4'>
                        <li className='flex items-center gap-1'>
                            <FaCheckCircle className='text-blue-600 tex-xl' />
                            Free for 30 days
                        </li>
                        <li className='flex items-center gap-1'>

                            <FaCheckCircle className='text-blue-600 tex-xl' />


                            Request a Demo
                        </li>
                    </ul>
                    <ul className='flex flex-col gap-4'>


                        <li className='flex items-center gap-1'>

                            <FaCheckCircle className='text-blue-600 tex-xl' />

                            No Credit Card Required</li>
                        <li className='flex items-center gap-1'>

                            <FaCheckCircle className='text-blue-600 tex-xl' />


                            Cancel anytime, no hidden fees</li>
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
         <div className='flex bg-blue-700 py-3 px-6 w-50 rounded-lg items-center mx-auto mt-10 cursor-pointer hover:bg-blue-400 duration-300'>
                    <p className='text-white'>Start free trial</p>
         </div>
        

        </div>
    )
}

export default Trail
