import React from 'react'

function BuiltSection() {
  const cards = [
    {
      title: 'Seamless experience',
      description: 'Switch between devices effortlessly as your business grows'
    },
    {
      title: 'Scalable modules',
      description: 'Activate only the features your team needs'
    },
    {
      title: 'Secure & reliable',
      description: 'Keep your data safe with industry-standard protection'
    }
  ];

  return (
    <div className='font-poppins px-4 py-12 md:px-8 lg:px-16 xl:px-24'>
      {/* Header Section */}
      <div className='max-w-3xl mx-auto text-center mb-12 md:mb-16'>
        <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>
          Built for businesses that want to do it all
        </h1>
        <p className='text-base md:text-lg text-gray-600 font-medium max-w-2xl mx-auto'>
          Designed to support small and mid-sized businesses with powerful tools for operations, finance, and HR - all in one platform.
        </p>
      </div>

      {/* Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto'>
        {cards.map((card, index) => (
          <div
            key={index}
            className='group bg-white rounded-xl p-6 md:p-8 border border-gray-100 
            shadow-lg hover:shadow-2xl transition-all duration-300 
            transform hover:-translate-y-1 hover:border-blue-100
            flex flex-col items-center text-center'
          >
           
            <h2 className='text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4'>
              {card.title}
            </h2>
            <p className='text-gray-600 text-sm md:text-base leading-relaxed'>
              {card.description}
            </p>
            
            {/* Hover Indicator */}
            <div className='mt-6 w-20 h-1 bg-blue-500 rounded-full opacity-0 
              group-hover:opacity-100 transition-opacity duration-300'>
            </div>
          </div>
        ))}
      </div>

      <div className='text-center mt-12 md:mt-16'>
        <button className='px-8 py-3 bg-blue-600 text-white font-semibold 
          rounded-lg shadow-lg hover:shadow-xl hover:bg-blue-700 
          transform hover:-translate-y-0.5 transition-all duration-300'>
          Explore Features
        </button>
      </div>
    </div>
  )
}

export default BuiltSection