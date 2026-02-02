'use client'
import { useState } from 'react'

export function ViewExpensesModal({
  open,
  onClose,
  expenses,
}: {
  open: boolean
  onClose: () => void
  expenses: any
}) {
  if (!open || !expenses) return null
  const [zoomOpen, setZoomOpen] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-poppins">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-lg flex flex-col py-10">

        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Expense Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Info label="Expense Title" value={expenses.title} />
            <Info label="Category" value={expenses.category} />
            <Info label="Amount" value={`₦${Number(expenses.amount).toLocaleString()}`} />
            <Info label="Paid To" value={expenses.paid_to} />
            <Info label="Added By" value={expenses.profiles?.full_name ?? '—'} />
            <Info label="Receipt Number" value={expenses.receipt_number ?? '—'} />

            <div>
              <p className="text-gray-500">Status</p>
              <span
                className={`inline-block rounded-full px-3 py-1 mt-3 text-xs font-semibold
                ${expenses.status === 'Approved'
                    ? 'bg-green-100 text-green-700'
                    : expenses.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
              >
                {expenses.status}
              </span>
            </div>

            <Info
              label="Added Date"
              value={new Date(expenses.created_at).toLocaleDateString()}
            />
          </div>

          {/* Note */}
          {expenses.note && (
            <div>
              <p className="text-gray-500 text-sm">Note / Description</p>
              <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">
                {expenses.note}
              </p>
            </div>
          )}

          {expenses.image ? (

            <div>
              <p className="mb-2 text-sm font-medium">Receipt Image <p className="mt-1 text-xs text-gray-400">
                Tap image to zoom
              </p>
              </p>

              <img
                src={expenses.image}
                alt="Receipt"
                onClick={() => setZoomOpen(true)}
                className="h-64 w-full cursor-zoom-in rounded-lg border object-contain bg-gray-50"
              />
            </div>


          ) : (
            <div>
              <h1>No Image attached to this receipt</h1>
            </div>
          )}
          {zoomOpen && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
              onClick={() => setZoomOpen(false)}
            >
              <img
                src={expenses.image}
                alt="Receipt zoomed"
                className="max-h-[90vh] max-w-[90vw] object-contain cursor-zoom-out"
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 text-right">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-6 py-2 text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-medium text-gray-900">{value || '—'}</p>
    </div>
  )
}
