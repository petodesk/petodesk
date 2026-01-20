
export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-10">
        <div className="flex flex-col items-center justify-center">
             <h1 className="text-3xl font-bold text-gray-800 mb-2">Enter verification code</h1>
        <p className="text-gray-600 mb-8">
          We sent a 6-digit code to your phone number. 
          <br />
          Enter it below to verify your account.
        </p>
        
        </div>
       
        {/* Verification code input fields */}
        <div className="mb-10">
          <div className="flex justify-between gap-3 md:gap-4">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                className="w-full h-14 md:h-16 text-3xl text-center font-bold border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
              />
            ))}
          </div>
        </div>
        
        {/* Submit button */}
        <button className="w-full btn-primary text-white font-semibold py-4 px-4 rounded-xl text-lg transition duration-200 shadow-md hover:shadow-lg">
          Submit
        </button>
      </div>
    </div>
  );
}