import Image from "next/image";
import success_icon from '../../assets/success.png'
import Link from "next/link";
export default function SuccessPage() {
  return (
    <div className="min-h-screen h-full bg-gradient-to-br from-green-30 to-gray-200 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
        
       <div className="flex justify-center mb-6">
  <Image
    src={success_icon} 
    alt="Success Icon" 
    className="w-20 h-20 md:w-20 md:h-20"
  />
</div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Thank You for Registering!
        </h1>
        
        <p className="text-gray-600 mb-10 text-lg">
          Our sales team will contact you within the next 24 hours to get you started.
        </p>
        
        {/* Go to Home button */}
        <button className="w-full btn-primary text-white font-semibold py-4 px-4 rounded-xl text-lg transition duration-200 shadow-md hover:shadow-lg">
            <Link href='/dashboard'>
          Go to Your Dashboard

            </Link>
        </button>
      </div>
    </div>
  );
}