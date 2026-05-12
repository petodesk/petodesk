export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
        <h1 className="text-xl font-bold text-red-600">
          Account Suspended
        </h1>

        <p className="mt-3 text-gray-600">
          Your company account has been suspended.
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Please contact the admin or Petodesk team for assistance.
        </p>
      </div>
    </div>
  )
}