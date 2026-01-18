import Image from 'next/image'
import React from 'react'
import ellipse from '../assets/ellipse 6.png'
import vec from '../assets/Vector (1).png'
import vec2 from '../assets/vec2.png'
import vec3 from '../assets/Vector (3).png'
import db from '../assets/db.png'
function ManageB() {
  return (
    <div className='flex flex-col gap-15 p-12 border-t borde-gray-200 mb-6'>
      <div className='flex gap-20 md:gap-100 justify-between items-center mx-auto'>
        <Image
        alt='ellep'
        src={ellipse}
        className='w-15 h-15'
        
        />
        <Image
        alt="vector"
        
        src={vec}/>
      </div>

      <div className='flex justify-between'>
     <Image
        alt="vector"
        className='hidden md:block w-15 h-15'
        src={db}/>
        <div className='flex flex-col gap-5 items-center'>
     <p className='text-4xl text-center md:text-3xl font-bold max-w-90'>Ready to start managing your
business smarter?</p>
<p className='btn-primary w-40 text-center rounded-lg text-white py-2 px-3'>
    Let’s do it
</p>
        </div>
         <Image
        alt="vector"
        className='hidden md:block w-15 h-15'
        src={db}/>
      </div>

      <div className='flex justify-between'>
         <Image
        alt="vector"
        
        src={vec}/>
         <Image
        alt="vector"
        
        src={vec2}/>
         <Image
        alt="vector"
        
        src={vec3}/>

      </div>

    </div>
  )
}

export default ManageB
