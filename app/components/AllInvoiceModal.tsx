'use client'

import { formatDate } from "../utils/dateFormatter"
import { useCompany } from "./CompanyContext"


type InvoiceItem = {
  item_name: string
  quantity: number
  item_type: string
  unit_price: number
  amount: number
}
type Invoices = {
  id: string
  invoice_number: string
  bill_to: string
  ship_to: string
  tax_rate: number
  due_date: string
  tax_amount: number
  total: number
  created_at: string
  profiles?: { full_name: string }
  invoice_payments?: {
    id: string,
    payment_status: string,
    bank_name: string,
    account_number: number,
    account_name: string
  }[]
  invoice_items: InvoiceItem[]
}

export function AllInvoiceModal({
  open,
  onClose,
  invoices,
  ActionMenu,
  loading,
}: {
  open: boolean
  onClose: () => void
  loading: boolean
  invoices: Invoices[]
  ActionMenu: any
}) {
  if (!open) return null
  const { currency } = useCompany()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 mx-4 my-20 w-full max-w-6xl md:mt-40 max-h-[90vh] bg-white rounded-xl shadow-lg flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b ">
          <h2 className="text-lg font-semibold">All Invoices</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        

        {/* Mobile view */}
        <div className="space-y-4 md:hidden overflow-y-auto px-6 py-4 max-h-[60vh]">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="rounded-xl bg-white p-4 shadow-sm border space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">
                  {formatDate(inv.created_at)}
                </p>
                <ActionMenu invoice={inv} />
              </div>

              <hr />

              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">Invoice #</p>
                <p className="text-base font-semibold text-gray-900">
                  {inv.invoice_number}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">Client</p>
                <p className="font-medium text-gray-800">
                  {inv.bill_to || '—'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">Amount</p>
                <p className="font-medium text-gray-800">
                  {currency} {inv.total.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">Added By</p>
                <p className="font-semibold text-gray-900">
                  {inv.profiles?.full_name || 'N/A'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700 mb-1">Status</p>
                <span className={`capitalize px-2 py-1 rounded-full text-xs ${inv.invoice_payments?.[0]?.payment_status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : inv.invoice_payments?.[0]?.payment_status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : inv.invoice_payments?.[0]?.payment_status === 'overdue'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {inv.invoice_payments?.[0]?.payment_status || 'Unpaid'}
                </span>

              </div>
            </div>
          ))}
          {!loading && invoices.length === 0 && (
            <div className="px-4 py-10 text-center text-gray-400">
              No invoices found for this period.
            </div>
          )}
        </div>

      {/* Desktop view */}
<div className="hidden md:block">
  {/* Header table */}
  <table className="w-full table-fixed text-sm">
    <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10">
      <tr>
        <th className="px-4 py-3 text-left font-medium w-[15%]">Date</th>
        <th className="px-4 py-3 text-left font-medium w-[20%]">Invoice #</th>
        <th className="px-4 py-3 text-left font-medium w-[20%]">Client</th>
        <th className="px-4 py-3 text-left font-medium w-[15%]">Amount</th>
        <th className="px-4 py-3 text-left font-medium w-[15%]">Status</th>
        <th className="px-4 py-3 text-left font-medium w-[15%]">Actions</th>
      </tr>
    </thead>
  </table>

  {/* Scrollable body */}
  <div className="max-h-[60vh] overflow-y-auto px-0 pb-10">
    <table className="w-full table-fixed text-sm">
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
              Loading invoices...
            </td>
          </tr>
        ) : invoices.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
              No invoices found for this period
            </td>
          </tr>
        ) : (
          invoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="border-t hover:bg-gray-50"
            >
              <td className="px-4 py-3 w-[15%]">
                {formatDate(invoice.created_at)}
              </td>
              <td className="px-4 py-3 w-[20%]">
                {invoice.invoice_number}
              </td>
              <td className="px-4 py-3 w-[20%]">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {invoice.bill_to}
                </span>
              </td>
              <td className="px-4 py-3 font-medium w-[15%]">
                {currency} {invoice.total.toLocaleString()}
              </td>
              <td className="px-4 py-3 w-[15%]">
                <span
                  className={`capitalize px-2 py-1 rounded-full text-xs ${
                    invoice.invoice_payments?.[0]?.payment_status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : invoice.invoice_payments?.[0]?.payment_status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {invoice.invoice_payments?.[0]?.payment_status || 'pending'}
                </span>
              </td>
              <td className="px-4 py-3 w-[15%]">
                <ActionMenu invoice={invoice} />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

      </div>


        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
