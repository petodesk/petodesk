import Image from 'next/image'
import React from 'react'
import logo from '../assets/log.png'
import { FaInstagram, FaLinkedin } from 'react-icons/fa'

function Footer() {
  return (
    <div className='flex flex-col bg-[#333333] gap-20 p-12'>
      <div className='flex flex-col gap-6 mx-auto'>
        <h1 className='text-xl md:text-2xl lg:text-3xl font-bold text-white'>Be Part of Our Community: Sign Up for Our Newsletter</h1>
        <div className='flex gap-5 md:gap-10 items-center '>
          <input
            className='w-[80%] rounded-lg p-2 border border-gray-300 text-gray-600 bg-white'
            placeholder='Enter your email address'

            type="text" />
          <div className='w-30 md:w-45 btn-secondary rounded-lg py-2 px-4 text-white text-center font-poppins'>
            subscribe
          </div>
        </div>
      </div>


      <div className=' flex flex-col-reverse gap-10 md:flex-row justify-between text-white'>
        <div className='flex flex-col gap-3'>
          <p className='text-lg font-semibold txt-white font-poppins'>PetoDesk</p>
          <div className='flex gap-1'>
            <a href="#"
            className="inline-block border-b-2 border-transparent hover:border-orange-300 transition duration-300">
            <FaLinkedin />

            </a>
            <a href="#"
            className="inline-block border-b-2 border-transparent hover:border-orange-300 transition duration-300">
              <FaInstagram />

            </a>
          </div>

           <div className='flex flex-col gap-2 mt-13'>
      <p className='text-sm'>© 2026 PetoDesk</p>
      <p className='text-sm font-semibold'>PetoDesk  - a product of Process Pro Tech</p>

     </div>


        </div>


        <div className='flex justify-between gap-20 md:gap-30'>

          <div className='flex flex-col gap-2 list-none'>

            <li className='text-xl font-bold font-poppins pb-2'>Company</li>
            <li >
              <li>
                <a
                  href=""
                  className="inline-block border-b-2 border-transparent hover:border-orange-300 transition duration-300"
                >
                  About
                </a>
              </li>

            </li>

            <li><a href=""
            className="inline-block border-b-2 border-transparent hover:border-orange-300 transition duration-300"
            >Contact Us</a> </li>
            <li><a href=""
            className="inline-block border-b-2 border-transparent hover:border-orange-300 transition duration-300"
            >Partrner</a> </li>
            <li><a href=""
            className="inline-block border-b-2 border-transparent hover:border-orange-300 transition duration-300"
            
            >Career</a> </li>


          </div>

          <div className='flex flex-col gap-2 list-none'>
            <li className='text-xl font-bold font-poppins pb-2'>Legal</li>
            <li><a href=""
            className="inline-block border-b-2 border-transparent hover:border-orange-300 transition duration-300"
            
            >Terms</a> </li>
            <li><a href=""
            className="inline-block border-b-2 border-transparent hover:border-orange-300 transition duration-300"
            >Privacy</a> </li>
            <li><a href=""
            className="inline-block border-b-2 border-transparent hover:border-orange-300 transition duration-300"
            >Resources</a> </li>
          </div>


        </div>
        <div className='hidden md:block'>

        </div>

      </div>
    
    </div>
  )
}

export default Footer
