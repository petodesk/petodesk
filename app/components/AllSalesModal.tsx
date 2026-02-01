'use client'

import { FaTimes } from 'react-icons/fa'

type Sale = {
  id: string
  created_at: string
  total_amount: number
  profiles: { full_name: string } | null
  sale_items: {
    status:string
    id: string
    subtotal:number
    quantity: number
    selling_price: number
    discount: number
    products: { name: string } | null
  }[]
}

export default function AllSalesModal({
  open,
  onClose,
  sales,
  ActionMenu,
  editingItemId,
  editQty,
  editOpen,
  setEditQty,
  loading
}: {
  open: boolean
  onClose: () => void
  sales: Sale[]
  ActionMenu: any
  editingItemId:any
  editQty:number
  editOpen:boolean
  loading:boolean
  setEditQty:any
}) {
  if (!open) return null

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 "
              onClick={onClose}
            />

            <div className="relative z-50 w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-lg flex flex-col py-10">
              {/* Header */}
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h2 className="text-lg font-semibold">All Sales</h2>
                <button className='cursor-pointer'
                onClick={onClose}>
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">

                {/* ---------------- MOBILE SALES CARDS ---------------- */}
                <div className="space-y-4 md:hidden">
                  {!loading &&
                    sales.flatMap((sale) =>
                      sale.sale_items.map((item) => {
                        const amount =
                          item.selling_price * item.quantity - item.discount

                        return (
                          <div
                            key={item.id}
                            className="rounded-xl bg-white p-4 shadow-sm border space-y-3"
                          >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-600">
                                {new Date(sale.created_at).toLocaleDateString()}
                              </p>
                              <ActionMenu
                                sale={sale}
                                item={item}
                                rowId={item.id}
                              />
                            </div>

                            <hr />

                            {/* Product Name */}
                            <div className="flex justify-between">
                              <span className="text-sm font-semibold text-gray-600">
                                Product
                              </span>
                              <span className="font-medium text-gray-900">
                                {item.products?.name ?? '—'}
                              </span>
                            </div>

                            {/* Quantity */}
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-600">
                                Quantity
                              </span>

                              {editingItemId === item.id ? (
                                <input
                                  type="number"
                                  min={1}
                                  value={editQty}
                                  onChange={(e) => setEditQty(+e.target.value)}
                                  className="w-20 rounded border px-2 py-1 text-sm"
                                />
                              ) : (
                                <span className="font-medium text-gray-900">
                                  {item.quantity}
                                </span>
                              )}
                            </div>

                            {/* Selling Price */}
                            <div className="flex justify-between">
                              <span className="text-sm font-semibold text-gray-600">
                                Selling Price
                              </span>
                              <span className="font-semibold text-gray-900">
                                ₦{item.selling_price.toLocaleString()}
                              </span>
                            </div>

                            {/* Amount */}
                            <div className="flex justify-between">
                              <span className="text-sm font-semibold text-gray-600">
                                Amount
                              </span>
                              <span className="font-semibold text-gray-900">
                                ₦{amount.toLocaleString()}
                              </span>
                            </div>

                            {/* Sold By */}
                            <div className="flex justify-between">
                              <span className="text-sm font-semibold text-gray-600">
                                Sold By
                              </span>
                              <span className="text-gray-800">
                                {sale.profiles?.full_name ?? '—'}
                              </span>
                            </div>

                            {/* Status */}
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-600">
                                Status
                              </span>
                              <span
                                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold
                            ${item.status === 'Cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                  }`}
                              >
                                {item.status}
                              </span>
                            </div>
                          </div>
                        )
                      })
                    )}

                  {!loading && sales.length === 0 && (
                    <div className="text-center text-gray-400 py-10">
                      No transactions for this period.
                    </div>
                  )}
                </div>

                {/* DESKTOP */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Item</th>
                        <th className="px-4 py-3 text-left">Qty</th>
                        <th className="px-4 py-3 text-left">Amount</th>
                        <th className="px-4 py-3 text-left">Sold By</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Action</th>
                      </tr>
                    </thead>

                    <tbody>
              {!loading &&
                sales.slice(0, 5).flatMap((sale) =>
                  sale.sale_items.map((item, index) => {
                    const amount =
                      item.selling_price * item.quantity - item.discount

                    return (
                      <tr
                        key={`${sale.id}-${index}`}
                        className="border-t"
                      >
                        <td className="px-4 py-3">
                          {new Date(sale.created_at).toLocaleDateString()}
                        </td>

                        <td className="px-4 py-3">
                          {item.products?.name ?? '—'
}
                        </td>

                        <td className="px-4 py-3">
                          {editingItemId === item.id ? (
                            <input
                              type="number"
                              min={1}
                              value={editQty}
                              onChange={(e) => setEditQty(+e.target.value)}
                              className="w-16 rounded border px-2 py-1 text-sm"
                            />
                          ) : (
                            item.quantity
                          )}

                        </td>





                        <td className="px-4 py-3">{item.selling_price}</td>

                        <td className="px-4 py-3">
                          ₦{amount.toLocaleString()}
                        </td>

                        <td className="px-4 py-3">
                          {sale.profiles?.full_name ?? '—'}
                        </td>

                        <td
                          className={`px-4 py-3 font-medium ${item.status === 'Cancelled'
                            ? 'text-red-500'
                            : 'text-blue-600'
                            }`}
                        >
                          {item.status}
                        </td>
                        <td className="px-4 py-3">
                          <ActionMenu
                            sale={sale}
                            item={item}
                            rowId={item.id}
                          />

                        </td>
                      </tr>
                    )
                  })
                )}

              {!loading && sales.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    No transactions for this period
                  </td>
                </tr>
              )}
            </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
  )
}
