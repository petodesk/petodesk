import { Suspense } from 'react'
import VerifyEmailContent from './VerifyEmailContent'

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <p className="text-center">Loading verification...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}